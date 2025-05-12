const axios = require('axios');
const FormData = require('form-data');
const { default: fetch } = require('node-fetch');

module.exports = function (app) {
    async function uploadToUguu(buffer, filename) {
        const form = new FormData();
        form.append('files[]', buffer, { filename });

        const res = await axios.post('https://uguu.se/upload.php', form, {
            headers: form.getHeaders()
        });

        if (!res.data.files || !res.data.files[0]) throw new Error('Upload gagal.');
        return res.data.files[0].url;
    }

    async function toAnime(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Gagal mengambil gambar dari URL');

        const buffer = await response.buffer();
        const contentType = response.headers.get('content-type');
        const ext = contentType?.split('/')[1] || 'jpg';
        const filename = `image.${ext}`;

        const uploadedUrl = await uploadToUguu(buffer, filename);
        const animeImageUrl = `https://fgsi1-restapi.hf.space/api/ai/toAnime?url=${encodeURIComponent(uploadedUrl)}`;

        return animeImageUrl;
    }

    app.get('/api/toanime', async (req, res) => {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ status: false, error: 'Parameter "url" diperlukan' });
        }

        try {
            const animeUrl = await toAnime(url);
            res.json({
                status: true,
                creator: "Danz-dev",
                result: {
                    animeUrl
                }
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
