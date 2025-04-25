const axios = require('axios');

module.exports = function(app) {
    async function getGoogleSearch(query) {
        const apiUrl = `https://api.ownblox.biz.id/api/googlesearch?q=${encodeURIComponent(query)}`;

        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true
            });

            const data = res.data;

            if (!data || data.status !== 200 || !data.results) {
                throw new Error('Gagal mendapatkan hasil pencarian Google.');
            }

            return data.results;
        } catch (err) {
            throw new Error(err.message || 'Gagal mengambil data dari API.');
        }
    }

    app.get('/search/google', async (req, res) => {
        const { q } = req.query;
        if (!q) return res.status(400).json({ status: false, error: 'Query pencarian wajib diisi' });

        try {
            const result = await getGoogleSearch(q);
            res.status(200).json({ status: true, creator: 'Danz-dev', results: result });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
