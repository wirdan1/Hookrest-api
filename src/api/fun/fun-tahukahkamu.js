const axios = require('axios');

module.exports = function(app) {
    async function getTahukahKamu() {
        const apiUrl = `https://api.ownblox.biz.id/api/tahukahkamu`;

        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true
            });

            const data = res.data;

            if (!data || data.status !== 200 || !data.result) {
                throw new Error('Gagal mendapatkan fakta menarik.');
            }

            return data.result;
        } catch (err) {
            throw new Error(err.message || 'Gagal mengambil data dari API.');
        }
    }

    app.get('/fun/tahukahkamu', async (req, res) => {
        try {
            const result = await getTahukahKamu();
            res.status(200).json({ status: true, creator: 'Danz-dev', result });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
