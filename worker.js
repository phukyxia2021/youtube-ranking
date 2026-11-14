/**
 * Cloudflare Worker: phục vụ static site + API đồng bộ YouTube -> Supabase
 *
 * Endpoint: GET/POST /api/sync-youtube   (được gọi bởi cron-job.org)
 * Xác thực: header "Authorization: Bearer <CRON_SECRET>" hoặc ?secret=<CRON_SECRET>
 *
 * Biến môi trường / Secrets cần cấu hình trên Cloudflare:
 *   SUPABASE_URL, SUPABASE_KEY (hoặc SUPABASE_SERVICE_ROLE_KEY), YOUTUBE_API_KEY, CRON_SECRET
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
        return (num / 1000).toFixed(num >= 100000 ? 0 : 1).replace(/\.0$/, '') + 'K';
    }
    return String(num);
}

function json(body, status = 200) {
    return new Response(JSON.stringify(body, null, 2), {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
}

async function syncYouTubeToDatabase(env, targetIds) {
    const supabaseUrl = (env.SUPABASE_URL || '').replace(/\/+$/, '');
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_KEY;
    const ytKey = env.YOUTUBE_API_KEY;
    if (!supabaseUrl || !supabaseKey || !ytKey) {
        throw new Error('Thiếu cấu hình SUPABASE_URL / SUPABASE_KEY / YOUTUBE_API_KEY.');
    }

    const sbHeaders = {
        apikey: supabaseKey,
        Authorization: 'Bearer ' + supabaseKey
    };

    // 1. Lấy danh sách kênh hiện có
    const listRes = await fetch(supabaseUrl + '/rest/v1/channels?select=*', {
        headers: { ...sbHeaders, Accept: 'application/json' }
    });
    if (!listRes.ok) {
        throw new Error('Không đọc được bảng channels (HTTP ' + listRes.status + '): ' + await listRes.text());
    }
    const channels = await listRes.json();

    const ids = (targetIds && targetIds.length ? targetIds : channels.map(c => c.id)).filter(Boolean);
    if (ids.length === 0) throw new Error('Không có Channel ID nào để đồng bộ.');

    // 2. Gọi YouTube API (tối đa 50 ID mỗi request)
    const statsById = {};
    for (let i = 0; i < ids.length; i += 50) {
        const chunk = ids.slice(i, i + 50);
        const ytUrl = 'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=' +
            encodeURIComponent(chunk.join(',')) + '&key=' + encodeURIComponent(ytKey);
        const ytRes = await fetch(ytUrl);
        if (!ytRes.ok) {
            throw new Error('YouTube API lỗi HTTP ' + ytRes.status + ': ' + await ytRes.text());
        }
        const data = await ytRes.json();
        for (const item of data.items || []) {
            const s = item.statistics || {};
            const subscribers = Number(s.subscriberCount || 0);
            statsById[item.id] = {
                subscribers,
                subscribers_formatted: formatSubscribersCount(subscribers),
                videos_count: Number(s.videoCount || 0),
                view_count: Number(s.viewCount || 0),
                published_at: (item.snippet && item.snippet.publishedAt) || null
            };
        }
    }

    // 3. Upsert các cột thống kê vào Supabase
    const nowIso = new Date().toISOString();
    const rows = [];
    for (const ch of channels) {
        const st = statsById[ch.id];
        if (!st) continue;
        rows.push({
            ...ch,
            subscribers: st.subscribers,
            subscribers_formatted: st.subscribers_formatted,
            videos_count: st.videos_count,
            view_count: st.view_count,
            published_at: ch.published_at || st.published_at,
            updated_at: nowIso
        });
    }

    let supabaseUpdated = false;
    let supabaseError = null;
    if (rows.length > 0) {
        const upRes = await fetch(supabaseUrl + '/rest/v1/channels?on_conflict=id', {
            method: 'POST',
            headers: {
                ...sbHeaders,
                'Content-Type': 'application/json',
                Prefer: 'resolution=merge-duplicates,return=minimal'
            },
            body: JSON.stringify(rows)
        });
        if (upRes.ok) {
            supabaseUpdated = true;
        } else {
            supabaseError = 'Supabase HTTP ' + upRes.status + ': ' + await upRes.text();
        }
    }

    return {
        success: supabaseUpdated,
        timestamp: nowIso,
        requestedChannels: ids.length,
        youtubeMatchedChannels: Object.keys(statsById).length,
        updatedRows: rows.length,
        supabaseUpdated,
        supabaseError
    };
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === '/api/sync-youtube') {
            if (!env.CRON_SECRET) {
                return json({ success: false, error: 'Server chưa cấu hình CRON_SECRET.' }, 500);
            }
            const auth = request.headers.get('Authorization') || '';
            const provided = auth.startsWith('Bearer ') ? auth.slice(7) : url.searchParams.get('secret');
            if (provided !== env.CRON_SECRET) {
                return json({ success: false, error: 'Unauthorized' }, 401);
            }
            if (request.method !== 'GET' && request.method !== 'POST') {
                return json({ success: false, error: 'Method not allowed' }, 405);
            }
            try {
                const idsParam = url.searchParams.get('ids');
                const targetIds = idsParam ? idsParam.split(',').map(s => s.trim()).filter(Boolean) : null;
                const result = await syncYouTubeToDatabase(env, targetIds);
                return json(result, result.success ? 200 : 500);
            } catch (err) {
                return json({ success: false, error: err.message }, 500);
            }
        }

        // Các đường dẫn khác: trả về static site
        return env.ASSETS.fetch(request);
    },

    // Xử lý tự động khi Cloudflare Cron Triggers kích hoạt
    async scheduled(event, env, ctx) {
        console.log(`[Cron Trigger] Bắt đầu đồng bộ tự động lúc: ${new Date().toISOString()}`);
        ctx.waitUntil(
            syncYouTubeToDatabase(env)
                .then(res => {
                    console.log('[Cron Trigger] Đồng bộ thành công:', JSON.stringify(res));
                })
                .catch(err => {
                    console.error('[Cron Trigger] Lỗi đồng bộ:', err.message);
                })
        );
    }
};
