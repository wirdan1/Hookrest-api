const axios = require('axios');

module.exports = function(app) {
    async function getPinterestResults(query) {
        const apiUrl = `https://api.ownblox.biz.id/api/pinterest?q=${encodeURIComponent(query)}`;

        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true
            });

            const data = res.data;

            if (!data?.status || !Array.isArray(data.results)) {
                throw new Error('Gagal mendapatkan hasil Pinterest.');
            }

            return data.results;
        } catch (err) {
            throw new Error(err.message || 'Gagal mengambil data dari API.');
        }
    }

    app.get('/dl/pinterest', async (req, res) => {
        const { q } = req.query;
        if (!q) return res.status(400).json({ status: false, error: 'Query is required' });

        try {
            const results = await getPinterestResults(q);
            res.status(200).json({ status: 200, creator: 'Danz-dev', results });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
