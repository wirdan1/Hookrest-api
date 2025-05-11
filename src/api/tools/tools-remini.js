const axios = require('axios');
const FormData = require('form-data');

module.exports = function (app) {
    async function uploadUguuFromUrl(imageUrl) {
        try {
            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(imageResponse.data, 'binary');

            const form = new FormData();
            form.append('files[]', buffer, { filename: 'upload.jpg' });

            const uploadRes = await axios.post('https://uguu.se/upload.php', form, {
                headers: form.getHeaders()
            });

            const uploaded = uploadRes.data?.files?.[0]?.url;
            if (!uploaded) throw new Error('Upload gambar ke Uguu gagal.');
            return uploaded;
        } catch (err) {
            throw new Error(err.message || 'Gagal mengambil atau mengupload gambar.');
        }
    }

    app.get('/api/remini', async (req, res) => {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ status: false, error: 'Parameter "url" diperlukan.' });
        }

        try {
            const uploadedUrl = await uploadUguuFromUrl(url);

            const upscaleRes = await axios.get(`https://api.kuromi.my.id/convert/upscale?url=${encodeURIComponent(uploadedUrl)}`, {
                validateStatus: () => true
            });

            const resultUrl = upscaleRes.data?.result?.data?.downloadUrls?.[0];
            if (!resultUrl) {
                throw new Error('Gagal memperjelas gambar.');
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
