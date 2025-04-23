const axios = require('axios');

module.exports = function(app) {
    async function getYTMP4(url) {
        try {
            if (!url.includes('youtu')) throw new Error('URL harus berupa link YouTube');

            const apiUrl = `https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(url)}`;
            const { data } = await axios.get(apiUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
                }
            });

            if (!data?.status || !data?.data?.dl) throw new Error('Video tidak ditemukan.');

            return data.data; // { title, dl }
        } catch (error) {
            throw new Error(error.response?.data?.error || error.message);
        }
    }

    app.get('/dl/ytmp4', async (req, res) => {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ status: false, error: 'URL is required' });
        }

        try {
            const result = await getYTMP4(url);
            res.status(200).json({ status: true, creator: 'Danz-dev', result });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
