const axios = require('axios');

module.exports = function(app) {
    async function getSpotifyPlay(query) {
        const apiUrl = `https://api.nekorinn.my.id/downloader/spotifyplay?q=${encodeURIComponent(query)}`;

        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true
            });

            const data = res.data;

            if (!data || data.status !== true || !data.result?.downloadUrl) {
                throw new Error('Gagal mendapatkan data Spotify.');
            }

            return data.result;
        } catch (err) {
            throw new Error(err.message || 'Gagal mengambil data dari API Spotify.');
        }
    }

    app.get('/dl/plays', async (req, res) => {
        const { q } = req.query;
        if (!q) return res.status(400).json({ status: false, error: 'Query parameter (q) is required' });

        try {
            const result = await getSpotifyPlay(q);
            res.json({
                status: true,
                result
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
