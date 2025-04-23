const axios = require('axios');

module.exports = function(app) {
    async function getYTMP3(url) {
        try {
            const api = `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(url)}`;
            const { data } = await axios.get(api);
            if (!data?.result?.audio) throw new Error('Audio tidak ditemukan.');
            return data.result;
        } catch (error) {
            throw new Error(error.message || 'Terjadi kesalahan saat memproses permintaan.');
        }
    }

    app.get('/dl/ytmp3', async (req, res) => {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'URL is required' });

        try {
            const result = await getYTMP3(url);
            res.status(200).json({
                status: true,
                creator: 'Danz-dev',
                result
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
