const axios = require('axios');

module.exports = function(app) {
    async function getYtmp4Download(url) {
        const apiUrl = `https://www.velyn.biz.id/api/downloader/ytmp4?url=${encodeURIComponent(url)}`;

        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true
            });

            const data = res.data;

            if (!data || !data.status || !data.data || !data.data.url) {
                throw new Error('Gagal mendapatkan data dari API YTMP4.');
            }

            return data;
        } catch (err) {
            throw new Error(err.message || 'Gagal mengambil data dari API YTMP4.');
        }
    }

    app.get('/dl/ytmp4', async (req, res) => {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ status: false, error: 'URL is required' });
        }

        try {
            const ytmp4Data = await getYtmp4Download(url);
            res.json({
                status: true,
                creator: "Danz-dev",
                data: {
                    format: ytmp4Data.data.format,
                    title: ytmp4Data.data.title,
                    url: ytmp4Data.data.url
                }
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
