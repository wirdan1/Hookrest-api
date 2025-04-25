const axios = require('axios');

module.exports = function(app) {
    async function getJadwalTV(text) {
        const apiUrl = `https://api.crafters.biz.id/search/jadwal?text=${encodeURIComponent(text)}`;

        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true
            });

            const data = res.data;

            if (!data || !data.status || !data.result) {
                throw new Error('Gagal mendapatkan jadwal TV.');
            }

            return data.result;
        } catch (err) {
            throw new Error(err.message || 'Gagal mengambil data dari API.');
        }
    }

    app.get('/search/jadwaltv', async (req, res) => {
        const { text } = req.query;
        if (!text) return res.status(400).json({ status: false, error: 'Text query is required' });

        try {
            const result = await getJadwalTV(text);
            res.status(200).json({ status: true, creator: 'Danz-dev', result });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
