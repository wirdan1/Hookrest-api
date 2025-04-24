const axios = require('axios');

module.exports = function(app) {
    async function getYTMP4(url) {
        const apiUrl = `https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(url)}`;
        try {
            const res = await axios.get(apiUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                },
                validateStatus: () => true // biar kita bisa handle 404 sendiri
            });

            if (!res.data?.status || !res.data?.data?.dl) {
                throw new Error(res.data?.message || 'Video tidak ditemukan.');
            }

            return res.data.data;
        } catch (error) {
            throw new Error(error.message || 'Gagal mengambil data.');
        }
    }

    app.get('/api/ytmp4', async (req, res) => {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'URL is required' });

        try {
            const result = await getYTMP4(url);
            res.status(200).json({ status: true, creator: 'Danz-dev', result });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
