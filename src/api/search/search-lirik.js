const axios = require('axios');

module.exports = function (app) {
    app.get('/search/lyrics', async (req, res) => {
        const { title } = req.query;

        if (!title) {
            return res.status(400).json({
                status: false,
                error: 'Parameter "title" diperlukan.'
            });
        }

        try {
            const { data } = await axios.get(`https://lrclib.net/api/search?q=${encodeURIComponent(title)}`, {
                headers: {
                    referer: `https://lrclib.net/search/${encodeURIComponent(title)}`,
                    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
                }
            });

            res.json({
                status: true,
                result: data
            });
        } catch (err) {
            res.status(500).json({
                status: false,
                error: 'Gagal mengambil lirik.',
                message: err.message
            });
        }
    });
};
