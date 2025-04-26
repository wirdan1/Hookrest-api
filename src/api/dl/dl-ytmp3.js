const axios = require('axios');

module.exports = function(app) {
    async function getYtmp3Download(url) {
        const apiUrl = `https://www.velyn.biz.id/api/downloader/ytmp3?url=${encodeURIComponent(url)}`;

        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true
            });

            const data = res.data;

            if (!data || !data.status || !data.output) {
                throw new Error('Gagal mendapatkan data dari API YTMP3.');
            }

            return data;
        } catch (err) {
            throw new Error(err.message || 'Gagal mengambil data dari API YTMP3.');
        }
    }

    app.get('/dl/ytmp3', async (req, res) => {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ status: false, error: 'URL is required' });
        }

        try {
            const ytmp3Data = await getYtmp3Download(url);
            res.json({
                status: true,
                creator: "Danz-dev",
                input: ytmp3Data.input,
                output: ytmp3Data.output
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
