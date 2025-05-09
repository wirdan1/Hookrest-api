const axios = require('axios');

module.exports = function (app) {
    async function fetchDouyin(url) {
        const apiUrl = `https://ytdlpyton.nvlgroup.my.id/douyin?url=${encodeURIComponent(url)}`;

        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true
            });

            const data = res.data;
            if (!data || data.status !== 200 || !data.media) {
                throw new Error('Gagal mengambil data dari Douyin API.');
            }

            return data;
        } catch (err) {
            throw new Error(err.message || 'Terjadi kesalahan saat memproses permintaan.');
        }
    }

    app.get('/dl/douyin', async (req, res) => {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ status: false, error: 'Parameter "url" diperlukan' });
        }

        try {
            const result = await fetchDouyin(url);
            res.json({
                status: true,
                creator: "Danz-dev",
                caption: result.caption,
                slide: result.slide,
                media: result.media
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
