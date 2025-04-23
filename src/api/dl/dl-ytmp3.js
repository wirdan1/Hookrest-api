const fetch = require('node-fetch');

module.exports = function(app) {
    async function getYTMP3(url) {
        try {
            if (!url.includes('youtu')) throw new Error('URL harus berupa link YouTube');

            const api = `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(url)}`;
            const response = await fetch(api, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
                }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (!data?.result?.audio) throw new Error('Audio tidak ditemukan.');

            return data.result;
        } catch (error) {
            console.error('Gagal fetch YTMP3:', error.message);
            throw error;
        }
    }

    app.get('/dl/ytmp3', async (req, res) => {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ status: false, error: 'URL is required' });
        }

        try {
            const result = await getYTMP3(url);
            res.status(200).json({ status: true, creator: 'Danz-dev', result });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
