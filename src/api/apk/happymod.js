const axios = require('axios');

module.exports = function(app) {
    async function getHappymodData(search) {
        const apiUrl = `https://api.siputzx.my.id/api/apk/happymod?search=${encodeURIComponent(search)}`;

        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true
            });

            const data = res.data;

            if (!data || data.status !== true || !Array.isArray(data.data)) {
                throw new Error('Gagal mendapatkan data dari Happymod.');
            }

            return data.data;
        } catch (err) {
            throw new Error(err.message || 'Gagal mengambil data dari API.');
        }
    }

    app.get('/apk/happymod', async (req, res) => {
        const { search } = req.query;
        if (!search) return res.status(400).json({ status: false, error: 'Search parameter is required' });

        try {
            const result = await getHappymodData(search);
            res.json({
                status: true,
                data: result
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
