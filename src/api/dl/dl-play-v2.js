const axios = require('axios');

module.exports = function(app) {
    async function getYtPlayAudio(query) {
        const apiUrl = `https://api.nekorinn.my.id/downloader/ytplay-savetube?q=${encodeURIComponent(query)}`;

        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true
            });

            const data = res.data;

            if (!data || !data.status || !data.result || !data.result.downloadUrl) {
                throw new Error('Gagal mendapatkan data dari API YTPlay SaveTube.');
            }

            return data;
        } catch (err) {
            throw new Error(err.message || 'Gagal mengambil data dari API YTPlay SaveTube.');
        }
    }

    app.get('/dl/playv2', async (req, res) => {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ status: false, error: 'Query parameter (q) is required' });
        }

        try {
            const ytplayData = await getYtPlayAudio(q);
            res.json({
                status: true,
                creator: "Danz-dev",
                result: {
                    title: ytplayData.result.metadata.title,
                    channel: ytplayData.result.metadata.channel,
                    duration: ytplayData.result.metadata.duration,
                    image: ytplayData.result.metadata.imageUrl,
                    link: ytplayData.result.metadata.link,
                    audio: ytplayData.result.downloadUrl
                }
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
