const axios = require('axios');

module.exports = function (app) {
    app.get('/tools/remini', async (req, res) => {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: 'Parameter "url" diperlukan.'
            });
        }

        try {
            const upscaleRes = await axios.get(`https://api.kuromi.my.id/convert/upscale?url=${encodeURIComponent(url)}`);

            const result = upscaleRes.data?.result?.data;

            if (!result?.downloadUrls?.[0]) {
                throw new Error('Gagal memperjelas gambar.');
            }

            res.json({
                success: true,
                status: 200,
                creator: "Danz-dev",
                result: {
                    code: 200,
                    data: {
                        downloadUrls: result.downloadUrls,  // Hanya mengembalikan URL gambar yang diperjelas
                        status: result.status || "success"
                    },
                    msg: "Success"
                }
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                status: 500,
                message: err.message
            });
        }
    });
};
