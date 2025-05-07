const axios = require('axios');

module.exports = function (app) {
    async function getSurah(no) {
        const apiUrl = `https://api.siputzx.my.id/api/s/surah?no=${no}`;

        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true
            });

            const data = res.data;
            if (!data || !data.status || !data.data) {
                throw new Error('Gagal mengambil data surah.');
            }

            return data.data;
        } catch (err) {
            throw new Error(err.message || 'Gagal mengambil data surah.');
        }
    }

    app.get('/search/surah', async (req, res) => {
        const { no } = req.query;
        if (!no) return res.status(400).json({ status: false, error: 'Parameter "no" diperlukan' });

        try {
            const ayat = await getSurah(no);
            res.json({
                status: true,
                creator: "Danz-dev",
                total: ayat.length,
                data: ayat
            });
        } catch (err) {
            res.status(500).json({ status: false, creator: "Danz-dev", error: err.message });
        }
    });
};
