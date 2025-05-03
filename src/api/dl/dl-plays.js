const axios = require('axios');

module.exports = function(app) {
    async function getSpotifyPlay(query) {
        const apiUrl = `https://api.nekorinn.my.id/downloader/spotifyplay?q=${encodeURIComponent(query)}`;

        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true
            });

            const data = res.data;

            if (!data || !data.status || !data.result || !data.result.downloadUrl) {
                throw new Error('Gagal mendapatkan data dari API SpotifyPlay.');
            }

            return data;
        } catch (err) {
            throw new Error(err.message || 'Gagal mengambil data dari API SpotifyPlay.');
        }
    }

    app.get('/dl/plays', async (req, res) => {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ status: false, error: 'Query parameter (q) is required' });
        }

        try {
            const spotifyData = await getSpotifyPlay(q);
            res.json({
                status: true,
                creator: "Danz-dev",
                result: {
                    title: spotifyData.result.metadata.title,
                    artist: spotifyData.result.metadata.artist,
                    duration: spotifyData.result.metadata.duration,
                    image: spotifyData.result.metadata.imageUrl,
                    link: spotifyData.result.metadata.link,
                    audio: spotifyData.result.downloadUrl
                }
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
