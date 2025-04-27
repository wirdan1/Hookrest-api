const axios = require('axios');

module.exports = function(app) {
    async function getAsmaulHusna() {
        const apiUrl = `https://api.vreden.my.id/api/islami/asmaulhusna`;

        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true
            });

            const data = res.data;

            if (!data || !data.result) {
                throw new Error('Gagal mendapatkan data dari API Asmaul Husna.');
            }

            return data;
        } catch (err) {
            throw new Error(err.message || 'Gagal mengambil data dari API Asmaul Husna.');
        }
    }

    app.get('/islami/asmaulhusna', async (req, res) => {
        try {
            const asmaulData = await getAsmaulHusna();
            res.json({
                status: 200,
                creator: "Danz-dev",
                result: asmaulData.result
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
