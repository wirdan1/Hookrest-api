const axios = require('axios');

module.exports = function(app) {
    async function getBratImageUrl(text) {
        const apiUrl = `https://brat.caliphdev.com/api/brat?text=${encodeURIComponent(text)}`;

        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true
            });

            const data = res.data;

            if (!data || data.status !== true || !data.result?.url) {
                throw new Error('Gagal mendapatkan URL gambar.');
            }

            return data.result.url;
        } catch (err) {
            throw new Error(err.message || 'Gagal mengambil data dari API.');
        }
    }

    app.get('/maker/brat', async (req, res) => {
        const { text } = req.query;
        if (!text) return res.status(400).json({ status: false, error: 'Text is required' });

        try {
            const imageUrl = await getBratImageUrl(text);
            const imageStream = await axios({
                url: imageUrl,
                method: 'GET',
                responseType: 'stream'
            });

            res.setHeader('Content-Type', 'image/png');
            imageStream.data.pipe(res);
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
