const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
const https = require('https');

module.exports = function (app) {
    async function uploadImage(buffer, filename) {
        const form = new FormData();
        form.append('files[]', buffer, filename);

        const res = await axios.post('https://uguu.se/upload.php', form, {
            headers: form.getHeaders()
        });

        if (!res.data.files || !res.data.files[0]) {
            throw new Error('Upload gagal.');
        }

        return res.data.files[0].url;
    }

    async function getAnimeImage(imageUrl) {
        const apiUrl = `https://fgsi1-restapi.hf.space/api/ai/toAnime?url=${encodeURIComponent(imageUrl)}`;
        const response = await axios.get(apiUrl, {
            responseType: 'arraybuffer',
            headers: {
                'Accept': 'image/*'
            }
        });

        return response.data;
    }

    app.post('/api/toanime', async (req, res) => {
        try {
            if (!req.files || !req.files.image) {
                return res.status(400).json({ status: false, error: 'Upload gambar diperlukan dengan field name "image"' });
            }

            const buffer = req.files.image.data;
            const filename = req.files.image.name;

            // Upload gambar ke Uguu
            const uploadedUrl = await uploadImage(buffer, filename);

            // Ambil gambar anime dari API
            const animeImage = await getAnimeImage(uploadedUrl);

            // Kirim sebagai file gambar
            res.setHeader('Content-Type', 'image/jpeg');
            res.send(animeImage);

        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
