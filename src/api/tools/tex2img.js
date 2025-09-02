const axios = require("axios");

module.exports = function (app) {
    const pollinations = {
        async generate(prompt) {
            const model = "flux"; // default model
            const width = 960;
            const height = 1280;
            const seed = Math.floor(Math.random() * 999999);
            const nologo = true;
            const enhance = true;
            const hidewatermark = true;

            try {
                const query = new URLSearchParams({
                    model,
                    width,
                    height,
                    seed,
                });

                if (nologo) query.set("nologo", "true");
                if (enhance) query.set("enhance", "true");
                if (hidewatermark) query.set("hidewatermark", "true");

                const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
                    prompt
                )}?${query.toString()}`;

                const res = await axios.get(url, {
                    responseType: "arraybuffer",
                });

                return Buffer.from(res.data, "binary");
            } catch (err) {
                throw new Error("Gagal generate image: " + err.message);
            }
        },
    };

    // Endpoint API Pollinations (hanya prompt bisa diubah)
    app.get("/tools/text2img", async (req, res) => {
        const { prompt } = req.query;

        if (!prompt) {
            return res.status(400).json({
                status: false,
                error: 'Parameter "prompt" wajib diisi',
            });
        }

        try {
            const buffer = await pollinations.generate(prompt);

            res.set("Content-Type", "image/png");
            res.send(buffer);
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
