const axios = require('axios');

module.exports = function(app) {
    async function getLlama(text) {
        const apiUrl = `https://api.siputzx.my.id/api/ai/llama33?prompt=Be%20a%20helpful%20assistant&text=${encodeURIComponent(text)}`;
        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true
            });

            if (!res.data?.status || !res.data?.data) {
                throw new Error(res.data?.message || 'Gagal mendapatkan respon.');
            }

            return { response: res.data.data };
        } catch (error) {
            throw new Error(error.message || 'Gagal mengambil data.');
        }
    }

    app.get('/ai/llama', async (req, res) => {
        const { text } = req.query;
        if (!text) {
            return res.status(400).json({ status: false, error: 'Text is required' });
        }

        try {
            const result = await getLlama(text);
            res.status(200).json({ status: true, creator: 'Danz-dev', result });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
