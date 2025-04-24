const axios = require('axios');

module.exports = function(app) {
    app.get('/dl/tiktok', async (req, res) => {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, message: 'URL is required' });

        try {
            const response = await axios.get(`https://api.ownblox.biz.id/api/ttdl?url=${encodeURIComponent(url)}`, {
                validateStatus: () => true
            });

            const data = response.data;
            if (data?.status !== 200 || !data.download_links) {
                return res.status(500).json({ status: false, message: 'Gagal mengambil data.' });
            }

            res.status(200).json({
                status: 200,
                creator: "Danz-dev",
                source: data.source,
                download_links: data.download_links
            });
        } catch (err) {
            res.status(500).json({ status: false, message: 'Request error' });
        }
    });
};
