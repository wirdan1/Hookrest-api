const axios = require('axios');

module.exports = function (app) {
    app.get('/api/toanime', async (req, res) => {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                status: false,
                creator: 'Danz-dev',
                message: 'Parameter "url" diperlukan'
            });
        }

        try {
            const response = await axios.get(`https://fgsi1-restapi.hf.space/api/ai/toAnime?url=${encodeURIComponent(url)}`);

            if (!response.data || !response.data.url) {
                throw new Error('Gagal mendapatkan gambar anime.');
            }

            res.json({
                status: true,
                creator: 'Danz-dev',
                result: {
                    original: url,
                    anime: response.data.url
                }
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                creator: 'Danz-dev',
                error: error.message
            });
        }
    });
};
