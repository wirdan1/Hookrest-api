const axios = require('axios');

module.exports = function(app) {
    async function getCuaca(kota) {
        const apiUrl = `https://api.ownblox.biz.id/api/cuaca?kota=${encodeURIComponent(kota)}`;

        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true
            });

            const data = res.data;

            if (!data || data.status !== 200 || !data.result) {
                throw new Error('Gagal mendapatkan data cuaca.');
            }

            return data.result;
        } catch (err) {
            throw new Error(err.message || 'Gagal mengambil data dari API.');
        }
    }

    app.get('/tools/cuaca', async (req, res) => {
        const { kota } = req.query;
        if (!kota) return res.status(400).json({ status: false, error: 'Kota wajib diisi' });

        try {
            const result = await getCuaca(kota);
            res.status(200).json({ status: true, creator: 'Danz-dev', result });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
