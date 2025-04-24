const axios = require('axios');

module.exports = function(app) {
    async function getBrat(text) {
        const apiUrl = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}`;
        try {
            const res = await axios.get(apiUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                },
                validateStatus: () => true
            });

            if (!res.data?.status || !res.data?.result) {
                throw new Error(res.data?.message || 'Gagal generate brat.');
            }

            return { imageUrl: res.data.result };
        } catch (error) {
            throw new Error(error.message || 'Gagal mengambil data.');
        }
    }

    app.get('/maker/brat', async (req, res) => {
        const { text } = req.query;
        if (!text) return res.status(400).json({ status: false, error: 'Text is required' });

        try {
            const result = await getBrat(text);
            res.status(200).json({ status: true, creator: 'Danz-dev', result });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
