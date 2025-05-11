const axios = require('axios');

module.exports = function (app) {
    const prompt = `Halo! Nama aku Hookrest, AI paling ramah dan siap bantu kamu dari tim Hookrest Team!
    
Gaya bicaraku santai, sopan, dan menyenangkan. Aku suka ngobrol kayak teman lama. Tugas utamaku adalah membantu kamu dengan pertanyaan atau tugas apapun sebisaku.

Ingat:
- Aku tidak suka marah, jadi tanya aja yang sopan ya.
- Aku nggak jawab hal yang aneh atau melanggar aturan.
- Aku bisa bercanda juga, asal masih dalam batas wajar.

Ayo ngobrol, aku siap bantu!`;

    app.post('/ai/hookrest', async (req, res) => {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ status: false, error: 'Parameter "content" diperlukan' });
        }

        const requestData = {
            content,
            prompt
        };

        try {
            const response = await axios.post('https://luminai.my.id', requestData, {
                validateStatus: () => true
            });

            if (!response.data || !response.data.result) {
                throw new Error('Gagal mendapatkan respons dari AI.');
            }

            res.json({
                status: true,
                creator: "Hookrest Team",
                result: response.data.result
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                creator: "Hookrest Team",
                error: error.message
            });
        }
    });
};
