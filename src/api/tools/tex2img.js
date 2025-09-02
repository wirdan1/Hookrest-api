const axios = require("axios");

module.exports = function (app) {
    const service = {
        async screenshot(targetUrl) {
            try {
                const res = await axios.post(
                    "https://gcp.imagy.app/screenshot/createscreenshot",
                    {
                        url: targetUrl,
                        browserWidth: 1280,
                        browserHeight: 720,
                        fullPage: true,
                        deviceScaleFactor: 1,
                        format: "png"
                    },
                    {
                        headers: {
                            accept: "application/json",
                            "content-type": "application/json",
                            origin: "https://imagy.app",
                            referer: "https://imagy.app/",
                            "user-agent":
                                "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36"
                        },
                        timeout: 20000 // 20 detik
                    }
                );

                if (!res.data || !res.data.fileUrl) {
                    throw new Error(
                        `Gagal ambil screenshot URL. Response: ${JSON.stringify(
                            res.data
                        )}`
                    );
                }

                const imgRes = await axios.get(res.data.fileUrl, {
                    responseType: "arraybuffer",
                    timeout: 20000
                });

                return Buffer.from(imgRes.data);
            } catch (err) {
                throw new Error(
                    `Gagal membuat screenshot: ${err.response?.status || ""} ${
                        err.response?.statusText || ""
                    } ${err.message}`
                );
            }
        }
    };

    app.get("/tools/screenshot", async (req, res) => {
        const { url } = req.query;
        if (!url) {
            return res
                .status(400)
                .json({ status: false, error: 'Parameter "url" wajib diisi' });
        }

        try {
            const buffer = await service.screenshot(url);
            res.setHeader("Content-Type", "image/png");
            res.send(buffer);
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
