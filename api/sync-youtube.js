/**
 * Vercel Serverless Function: GET/POST /api/sync-youtube
 * Được gọi định kỳ bởi dịch vụ Cronjob bên ngoài (cron-job.org, EasyCron...)
 *
 * Bảo vệ bằng biến môi trường CRON_SECRET:
 *   - Header:  Authorization: Bearer <CRON_SECRET>
 *   - hoặc:    /api/sync-youtube?secret=<CRON_SECRET>
 */
const { syncYouTubeToDatabase } = require('../api-sync-youtube');

module.exports = async (req, res) => {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        return res.status(500).json({ success: false, error: 'Server chưa cấu hình CRON_SECRET.' });
    }

    const authHeader = req.headers['authorization'] || '';
    const provided = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.query && req.query.secret);
    if (provided !== secret) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    try {
        const idsParam = req.query && req.query.ids;
        const targetIds = idsParam ? String(idsParam).split(',').map(s => s.trim()).filter(Boolean) : null;
        const result = await syncYouTubeToDatabase(targetIds);
        // Rút gọn phản hồi để cron service không phải nhận payload lớn
        return res.status(200).json({
            success: result.success,
            timestamp: result.timestamp,
            requestedChannels: result.requestedChannels,
            youtubeMatchedChannels: result.youtubeMatchedChannels,
            supabaseUpdated: result.supabaseUpdated,
            supabaseError: result.supabaseError
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};
