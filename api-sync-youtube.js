/**
 * API & Script tự động đồng bộ thống kê kênh YouTube vào Supabase Database
 * Đọc cấu hình trực tiếp từ `supabase.txt` và `youtube.txt` trong thư mục dự án.
 *
 * Các cột được cập nhật tự động:
 * - subscribers
 * - subscribers_formatted
 * - videos_count
 * - view_count
 *
 * Cách sử dụng:
 * 1. Chạy cập nhật ngay lập tức (CLI / Cron):
 *    node api-sync-youtube.js
 *
 * 2. Chạy dưới dạng HTTP API Server (mặc định cổng 3000):
 *    node api-sync-youtube.js --serve
 *    -> Gọi GET hoặc POST http://localhost:3000/api/sync-youtube để kích hoạt cập nhật
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const PROJECT_DIR = __dirname;
const SUPABASE_TXT_PATH = path.join(PROJECT_DIR, 'supabase.txt');
const YOUTUBE_TXT_PATH = path.join(PROJECT_DIR, 'youtube.txt');
const CHANNELS_DATA_PATH = path.join(PROJECT_DIR, 'channels-data.js');

/**
 * Đọc thông tin kết nối từ supabase.txt
 */
function loadSupabaseConfig() {
    // Ưu tiên biến môi trường (dùng khi deploy lên Vercel/hosting)
    const envUrl = process.env.SUPABASE_URL;
    const envKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
    if (envUrl && envKey) {
        return { url: envUrl.trim().replace(/\/+$/, ''), publishableKey: envKey.trim(), password: null };
    }

    const raw = fs.readFileSync(SUPABASE_TXT_PATH, 'utf8');
    const urlMatch = raw.match(/Project URL:\s*(\S+)/i);
    const keyMatch = raw.match(/Publish key:\s*(\S+)/i);
    const passMatch = raw.match(/Password:\s*(\S+)/i);

    if (!urlMatch || !keyMatch) {
        throw new Error('Không tìm thấy Project URL hoặc Publish key hợp lệ trong supabase.txt');
    }

    return {
        url: urlMatch[1].trim().replace(/\/+$/, ''),
        publishableKey: keyMatch[1].trim(),
        password: passMatch ? passMatch[1].trim() : null
    };
}

/**
 * Đọc endpoint và API key từ youtube.txt
 */
function loadYouTubeConfig() {
    // Ưu tiên biến môi trường (dùng khi deploy lên Vercel/hosting)
    if (process.env.YOUTUBE_API_KEY) {
        return {
            endpoint: 'https://www.googleapis.com/youtube/v3/channels',
            part: 'snippet,statistics',
            apiKey: process.env.YOUTUBE_API_KEY.trim()
        };
    }

    const raw = fs.readFileSync(YOUTUBE_TXT_PATH, 'utf8').trim();
    const parsedUrl = new URL(raw);
    const apiKey = parsedUrl.searchParams.get('key');
    const part = parsedUrl.searchParams.get('part') || 'snippet,statistics';
    const endpoint = parsedUrl.origin + parsedUrl.pathname;

    if (!apiKey) {
        throw new Error('Không tìm thấy tham số key=... trong file youtube.txt');
    }

    return {
        endpoint,
        part,
        apiKey
    };
}

/**
 * Định dạng số lượng người đăng ký thành chuỗi rút gọn (VD: 375M, 4.59M, 75.4K)
 */
function formatSubscribersCount(subscribers) {
    const num = Number(subscribers) || 0;
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2).replace(/\.?0+$/, '') + 'B';
    }
    if (num >= 1000000) {
        const decimals = num >= 100000000 ? 0 : (num >= 10000000 ? 1 : 2);
        return (num / 1000000).toFixed(decimals).replace(/\.?0+$/, '') + 'M';
    }
    if (num >= 1000) {
        const decimals = num >= 100000 ? (num % 100000 === 0 ? 0 : (num >= 1000000 ? 0 : 0)) : (num % 1000 === 0 ? 0 : 1);
        const str = (num / 1000).toFixed(num >= 100000 ? 0 : 1).replace(/\.0$/, '');
        return str + 'K';
    }
    return String(num);
}

/**
 * Đọc danh sách kênh dự phòng từ channels-data.js nếu bảng Supabase chưa có dữ liệu
 */
function loadLocalChannelsFallback() {
    const code = fs.readFileSync(CHANNELS_DATA_PATH, 'utf8');
    const match = code.match(/const\s+CHANNELS_DATA\s*=\s*(\[[\s\S]*?\]);/);
    if (!match) return [];
    const fn = new Function('return ' + match[1]);
    return fn();
}

/**
 * Lấy danh sách các kênh hiện có từ bảng `channels` trong Supabase
 */
async function fetchExistingChannelsFromSupabase(supabaseCfg) {
    const endpoint = `${supabaseCfg.url}/rest/v1/channels?select=*`;
    const res = await fetch(endpoint, {
        headers: {
            'apikey': supabaseCfg.publishableKey,
            'Authorization': `Bearer ${supabaseCfg.publishableKey}`,
            'Accept': 'application/json'
        }
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Không thể đọc bảng channels từ Supabase (HTTP ${res.status}): ${text}`);
    }

    return await res.json();
}

/**
 * Gọi YouTube Data API v3 theo từng nhóm tối đa 50 channel IDs
 */
async function fetchYouTubeChannelStats(ytCfg, channelIds) {
    const statsById = {};
    const batchSize = 50;

    for (let i = 0; i < channelIds.length; i += batchSize) {
        const chunk = channelIds.slice(i, i + batchSize);
        const queryUrl = `${ytCfg.endpoint}?part=${encodeURIComponent(ytCfg.part)}&id=${encodeURIComponent(chunk.join(','))}&key=${encodeURIComponent(ytCfg.apiKey)}`;

        const res = await fetch(queryUrl);
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`YouTube API trả về lỗi HTTP ${res.status}: ${errText}`);
        }

        const data = await res.json();
        const items = Array.isArray(data.items) ? data.items : [];

        for (const item of items) {
            const stats = item.statistics || {};
            const snippet = item.snippet || {};
            const subscribers = Number(stats.subscriberCount || 0);
            const videosCount = Number(stats.videoCount || 0);
            const viewCount = Number(stats.viewCount || 0);

            statsById[item.id] = {
                id: item.id,
                subscribers,
                subscribers_formatted: formatSubscribersCount(subscribers),
                videos_count: videosCount,
                view_count: viewCount,
                published_at: snippet.publishedAt || null
            };
        }
    }

    return statsById;
}

/**
 * Cập nhật các cột (subscribers, subscribers_formatted, videos_count, view_count) vào Supabase
 */
async function syncYouTubeToDatabase(targetIds = null) {
    const supabaseCfg = loadSupabaseConfig();
    const ytCfg = loadYouTubeConfig();

    let baseChannels = [];
    try {
        baseChannels = await fetchExistingChannelsFromSupabase(supabaseCfg);
    } catch (err) {
        console.warn('[Cảnh báo] Không đọc được danh sách từ Supabase, chuyển sang đọc từ channels-data.js:', err.message);
    }

    if (!Array.isArray(baseChannels) || baseChannels.length === 0) {
        baseChannels = loadLocalChannelsFallback();
    }

    const idsToSync = Array.isArray(targetIds) && targetIds.length > 0
        ? targetIds
        : baseChannels.map(c => c.id).filter(Boolean);

    if (idsToSync.length === 0) {
        throw new Error('Không tìm thấy Channel ID nào để đồng bộ.');
    }

    const statsById = await fetchYouTubeChannelStats(ytCfg, idsToSync);
    const nowIso = new Date().toISOString();
    const updatedRecords = [];

    for (const ch of baseChannels) {
        const ytStat = statsById[ch.id];
        if (!ytStat) continue;

        updatedRecords.push({
            id: ch.id,
            name: ch.name,
            handle: ch.handle || null,
            avatar: ch.avatar || 'default-channel-thumbnail.jpg',
            banner: ch.banner || 'default-channel-banner.jpg',
            subscribers: ytStat.subscribers,
            subscribers_formatted: ytStat.subscribers_formatted,
            category: ch.category || 'Entertainment',
            videos_count: ytStat.videos_count,
            view_count: ytStat.view_count,
            description: ch.description || null,
            url: ch.url || null,
            website: ch.website || null,
            facebook: ch.facebook || null,
            twitter: ch.twitter || null,
            tiktok: ch.tiktok || null,
            published_at: ch.published_at || ytStat.published_at || null,
            updated_at: nowIso
        });
    }

    // Ghi cập nhật lên bảng channels của Supabase (Upsert theo khóa chính id)
    let supabaseUpdated = false;
    let supabaseError = null;

    if (updatedRecords.length > 0) {
        const upsertUrl = `${supabaseCfg.url}/rest/v1/channels?on_conflict=id`;
        const res = await fetch(upsertUrl, {
            method: 'POST',
            headers: {
                'apikey': supabaseCfg.publishableKey,
                'Authorization': `Bearer ${supabaseCfg.publishableKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates,return=representation'
            },
            body: JSON.stringify(updatedRecords)
        });

        if (!res.ok) {
            const errBody = await res.text();
            supabaseError = `Supabase HTTP ${res.status}: ${errBody}`;
        } else {
            supabaseUpdated = true;
        }
    }

    return {
        success: true,
        timestamp: nowIso,
        requestedChannels: idsToSync.length,
        youtubeMatchedChannels: Object.keys(statsById).length,
        supabaseUpdated,
        supabaseError,
        updatedColumns: ['subscribers', 'subscribers_formatted', 'videos_count', 'view_count'],
        channels: updatedRecords.map(r => ({
            id: r.id,
            name: r.name,
            subscribers: r.subscribers,
            subscribers_formatted: r.subscribers_formatted,
            videos_count: r.videos_count,
            view_count: r.view_count
        }))
    };
}

/**
 * Khởi chạy HTTP Server cho API tự động cập nhật
 */
function startApiServer(port = 3000) {
    const server = http.createServer(async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        const parsedUrl = new URL(req.url, `http://localhost:${port}`);

        if (parsedUrl.pathname === '/api/sync-youtube' && (req.method === 'GET' || req.method === 'POST')) {
            try {
                const idsParam = parsedUrl.searchParams.get('ids');
                const targetIds = idsParam ? idsParam.split(',').map(s => s.trim()).filter(Boolean) : null;
                const result = await syncYouTubeToDatabase(targetIds);

                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify(result, null, 2));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({
                    success: false,
                    error: err.message
                }, null, 2));
            }
            return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            message: 'Sử dụng endpoint GET hoặc POST /api/sync-youtube để cập nhật thống kê kênh từ YouTube API vào Supabase.'
        }));
    });

    server.listen(port, () => {
        console.log(`[YouTube Sync API] Server đang chạy tại: http://localhost:${port}/api/sync-youtube`);
    });
}

if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.includes('--serve')) {
        const portIndex = args.indexOf('--port');
        const port = portIndex !== -1 && args[portIndex + 1] ? Number(args[portIndex + 1]) : 3000;
        startApiServer(port);
    } else {
        console.log('Đang gọi YouTube API (từ youtube.txt) và đồng bộ vào Supabase (từ supabase.txt)...');
        syncYouTubeToDatabase()
            .then(result => {
                console.log('Kết quả đồng bộ:', JSON.stringify(result, null, 2));
                if (result.supabaseError) {
                    console.warn('Lưu ý Supabase:', result.supabaseError);
                }
            })
            .catch(err => {
                console.error('Lỗi đồng bộ:', err.message);
                process.exitCode = 1;
            });
    }
}

module.exports = {
    syncYouTubeToDatabase,
    formatSubscribersCount
};
