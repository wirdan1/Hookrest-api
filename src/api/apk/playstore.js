const axios = require('axios');

module.exports = function(app) {
    async function getPlaystoreData(query) {
        const apiUrl = `https://api.siputzx.my.id/api/apk/playstore?query=${encodeURIComponent(query)}`;

        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true
            });

            const data = res.data;

            if (!data || data.status !== true || !Array.isArray(data.data)) {
                throw new Error('Gagal mendapatkan data Playstore.');
            }

            return data.data;
        } catch (err) {
            throw new Error(err.message || 'Gagal mengambil data dari API.');
        }
    }

    app.get('/apk/playstore', async (req, res) => {
        const { query } = req.query;
        if (!query) return res.status(400).json({ status: false, error: 'Query is required' });

        try {
            const result = await getPlaystoreData(query);
            res.json({
                status: true,
                data: result
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
