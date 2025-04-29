const axios = require('axios');

module.exports = function(app) {
    app.get('/fun/hytam', async (req, res) => {
        const { url } = req.query;
        if (!url || !type) {
            return res.status(400).json({ status: false, error: 'URL dan type diperlukan' });
        }

        const apiUrl = `https://www.abella.icu/penghitam?url=${encodeURIComponent(url)}&type=hitam`;

        try {
            const response = await axios.get(apiUrl, {
                responseType: 'arraybuffer',
                validateStatus: () => true
            });

            if (response.status !== 200) {
                throw new Error('Gagal mengambil gambar dari API Penghitam.');
            }

            res.set('Content-Type', 'image/jpeg');
            res.send(response.data);
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
