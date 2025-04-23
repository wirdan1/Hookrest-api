const axios = require('axios');

module.exports = function(app) {
    async function getYTMP3(url) {
        try {
            const api = `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(url)}`;
            console.log('Requesting API:', api);

            const { data } = await axios.get(api, {
                responseType: 'json',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
                }
            });

            console.log('API Response:', data);

            if (!data?.result?.audio) throw new Error('Audio tidak ditemukan.');
            return data.result;
        } catch (error) {
            console.error('Error saat mengambil YTMP3:', error.message);
            throw new Error(error.message || 'Terjadi kesalahan saat memproses permintaan.');
        }
    }

    app.get('/dl/ytmp3', async (req, res) => {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ status: false, error: 'URL is required' });
        }

        console.log('URL Query:', url);

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
