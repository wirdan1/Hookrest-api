const axios = require('axios');

module.exports = function (app) {
    async function upscaleImage(url) {
        const apiUrl = `https://api.kuromi.my.id/convert/upscale?url=${encodeURIComponent(url)}`;

        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true,
                responseType: 'arraybuffer', // Menetapkan respons sebagai binary (gambar)
            });

            const data = res.data;

            if (!data.success || !data.result || !data.result.data) {
                throw new Error('Gagal mendapatkan hasil upscale.');
            }

            return data.result.data;  // Mengembalikan data gambar
        } catch (err) {
            throw new Error(err.message || 'Terjadi kesalahan saat memproses permintaan upscale.');
        }
    }

    app.get('/api/upscale', async (req, res) => {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ status: false, error: 'Parameter "url" diperlukan' });
        }

        try {
            const result = await upscaleImage(url);

            // Mengirim gambar yang dihasilkan langsung ke respons
            res.set('Content-Type', 'image/jpeg');  // Set konten jenis gambar (misalnya jpeg)
            res.send(result);  // Kirim gambar sebagai binary data
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
