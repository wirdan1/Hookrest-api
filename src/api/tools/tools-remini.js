const axios = require('axios');

module.exports = function (app) {
    async function upscaleImage(url) {
        const apiUrl = `https://api.kuromi.my.id/convert/upscale?url=${encodeURIComponent(url)}`;

        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true
            });

            const data = res.data;

            if (!data.success || !data.result || !data.result.data) {
                throw new Error('Gagal mendapatkan hasil upscale.');
            }

            return data.result;
        } catch (err) {
            throw new Error(err.message || 'Terjadi kesalahan saat memproses permintaan upscale.');
        }
    }

    app.get('/tools/remini', async (req, res) => {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ status: false, error: 'Parameter "url" diperlukan' });
        }

        try {
            const result = await upscaleImage(url);
            res.json({
                status: true,
                creator: "Danz-dev",
                result: {
                    downloadUrls: result.data.downloadUrls,
                    filesize: result.data.filesize,
                    imagemimetype: result.data.imagemimetype,
                    originalfilename: result.data.originalfilename,
                    status: result.data.status
                },
                msg: result.msg
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
