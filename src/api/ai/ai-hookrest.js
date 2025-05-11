const axios = require('axios');

module.exports = function (app) {
    async function askHookrest(text, user) {
        const prompt = `
Kamu adalah Hookrest, AI asisten ramah dan cerdas dari Hookrest Team.
Tugas kamu adalah membantu pengguna dengan jawaban yang jelas, sopan, dan bermanfaat.
Gunakan bahasa santai namun tetap profesional.
Jangan gunakan bahasa kasar, dan selalu berikan solusi atau jawaban terbaik.
`;

        const requestData = {
            content: text,
            user,
            prompt
        };

        try {
            const response = await axios.post('https://luminai.my.id', requestData);
            return response.data.result;
        } catch (error) {
            console.error("Error:", error);
            throw new Error("Maaf, terjadi kesalahan saat memproses permintaan.");
        }
    }

    app.get('/ai/hookrest', async (req, res) => {
        const { text, user } = req.query;
        if (!text || !user) {
            return res.status(400).json({ status: false, error: 'Parameter "text" dan "user" diperlukan.' });
        }

        try {
            const result = await askHookrest(text, user);
            res.json({ status: true, creator: "Hookrest Team", result });
        } catch (err) {
            res.status(500).json({ status: false, creator: "Hookrest Team", error: err.message });
        }
    });
};
