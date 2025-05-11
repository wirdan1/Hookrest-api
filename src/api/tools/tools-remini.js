const axios = require('axios');
const FormData = require('form-data');

module.exports = function (app) {
    async function uploadUguu(buffer, filename) {
        const form = new FormData();
        form.append('files[]', buffer, { filename });

        try {
            const response = await axios.post('https://uguu.se/upload.php', form, {
                headers: form.getHeaders()
            });

            const uploaded = response.data?.files?.[0]?.url;
            if (!uploaded) throw new Error('Upload gambar gagal.');
            return uploaded;
        } catch (err) {
            throw new Error(err.message || 'Gagal mengupload gambar.');
        }
    }

    app.post('/tools/remini', async (req, res) => {
        const { imageBase64 } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ status: false, error: 'Parameter "imageBase64" diperlukan.' });
        }

        try {
            // Konversi base64 ke buffer
            const buffer = Buffer.from(imageBase64, 'base64');
            const uploadedUrl = await uploadUguu(buffer, 'enhance.jpg');

            const upscaleRes = await axios.get(`https://api.kuromi.my.id/convert/upscale?url=${encodeURIComponent(uploadedUrl)}`, {
                validateStatus: () => true
            });

            const resultUrl = upscaleRes.data?.result?.data?.downloadUrls?.[0];
            if (!resultUrl) {
                throw new Error('Gagal memproses gambar.');
            }

            res.json({
                status: true,
                creator: "Danz-dev",
                result: resultUrl
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
