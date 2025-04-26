const axios = require('axios');

module.exports = function(app) {
    async function getGeminiResponse(prompt) {
        const apiUrl = `https://www.velyn.biz.id/api/ai/gemini?prompt=${encodeURIComponent(prompt)}`;

        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true
            });

            const data = res.data;

            if (!data || !data.status || !data.data) {
                throw new Error('Gagal mendapatkan respon dari API Gemini.');
            }

            return data.data; // langsung return isi 'data' dari API
        } catch (err) {
            throw new Error(err.message || 'Gagal mengambil data dari API Gemini.');
        }
    }

    app.get('/api/gemini', async (req, res) => {
        const { prompt } = req.query;
        if (!prompt) {
            return res.status(400).json({ status: false, error: 'Prompt is required' });
        }

        try {
            const response = await getGeminiResponse(prompt);
            res.json({
                status: true,
                creator: "YourName", // bisa diubah sesuai identitas kamu
                data: response
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
