const axios = require('axios');

module.exports = function(app) {
    async function getRandomMemes(count) {
        const apiUrl = `https://api.ownblox.biz.id/api/randommeme?count=${count}`;

        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true
            });

            const data = res.data;

            if (!data || !Array.isArray(data)) {
                throw new Error('Gagal mendapatkan data dari API Random Meme.');
            }

            return data;
        } catch (err) {
            throw new Error(err.message || 'Gagal mengambil data dari API Random Meme.');
        }
    }

    app.get('/random/meme', async (req, res) => {
        const count = parseInt(req.query.count) || 1;

        try {
            const memes = await getRandomMemes(count);
            res.json({
                status: true,
                creator: "Danz-dev",
                result: memes
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
