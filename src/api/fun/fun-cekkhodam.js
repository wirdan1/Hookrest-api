const axios = require('axios');

module.exports = function(app) {
    async function cekKhodam(nama) {
        const apiUrl = `https://api.ownblox.biz.id/api/cekkhodam?nama=${encodeURIComponent(nama)}`;

        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true
            });

            const data = res.data;

            if (!data || data.status !== 200 || !data.result) {
                throw new Error('Gagal mendapatkan hasil khodam.');
            }

            return data.result;
        } catch (err) {
            throw new Error(err.message || 'Gagal mengambil data dari API.');
        }
    }

    app.get('/fun/cekkhodam', async (req, res) => {
        const { nama } = req.query;
        if (!nama) return res.status(400).json({ status: false, error: 'Nama is required' });

        try {
            const result = await cekKhodam(nama);
            res.status(200).json({ status: true, creator: 'Danz-dev', result });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
