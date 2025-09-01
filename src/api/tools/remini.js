const axios = require("axios");
const FormData = require("form-data");

module.exports = function (app) {
    const Keyy = "-mY6Nh3EWwV1JihHxpZEGV1hTxe2M_zDyT0i8WNeDV4buW9l02UteD6ZZrlAIO0qf6NhYA";

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    const service = {
        async processImage(imageUrl) {
            try {
                const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
                const form = new FormData();
                form.append("file", Buffer.from(imgRes.data), { filename: "image.jpg" });

                const uploadRes = await axios.post(
                    "https://reaimagine.zipoapps.com/enhance/autoenhance/",
                    form,
                    {
                        headers: {
                            ...form.getHeaders(),
                            Authorization: Keyy,
                            "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 10; Redmi Note 5 Pro Build/QQ3A.200805.001)",
                        },
                    }
                );

                const name = uploadRes.headers["name"] || uploadRes.data?.name;
                if (!name) throw new Error("Gagal ambil 'name' dari upload response");

                let attempts = 0;
                const maxAttempts = 20;

                while (attempts < maxAttempts) {
                    attempts++;
                    try {
                        const res = await axios.post(
                            "https://reaimagine.zipoapps.com/enhance/request_res/",
                            null,
                            {
                                headers: {
                                    name,
                                    app: "enhanceit",
                                    ad: "0",
                                    Authorization: Keyy,
                                    "Content-Type": "application/x-www-form-urlencoded",
                                    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 10; Redmi Note 5 Pro Build/QQ3A.200805.001)",
                                },
                                responseType: "arraybuffer",
                                validateStatus: () => true,
                            }
                        );

                        if (res.status === 200 && res.data && res.data.length > 0) {
                            return Buffer.from(res.data);
                        }
                    } catch {}
                    await sleep(5000);
                }

                throw new Error("Gagal dapat hasil setelah banyak percobaan.");
            } catch (err) {
                throw err;
            }
        },
    };

    app.get("/tools/remini", async (req, res) => {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({
                status: false,
                error: 'Parameter "url" wajib diisi',
            });
        }

        try {
            const buffer = await service.processImage(url);
            res.set("Content-Type", "image/png");
            res.send(buffer);
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
