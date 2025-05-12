const axios = require('axios');
const fs = require('fs');
const path = require('path');

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

            // Membuat file sementara menggunakan tmp
            tmp.file({ 
                prefix: 'upscaled_', 
                postfix: '.jpg', 
                discardDescriptor: true 
            }, (err, tempFilePath, fd, cleanupCallback) => {
                if (err) {
                    return res.status(500).json({ status: false, error: 'Gagal membuat file sementara' });
                }

                // Menyimpan gambar hasil upscale ke file sementara
                fs.writeFile(tempFilePath, result, async (writeErr) => {
                    if (writeErr) {
                        cleanupCallback();
                        return res.status(500).json({ status: false, error: 'Gagal menyimpan gambar sementara' });
                    }

                    // Mengirimkan gambar sementara sebagai response
                    res.sendFile(tempFilePath, (sendErr) => {
                        if (sendErr) {
                            return res.status(500).json({ status: false, error: 'Gagal mengirim gambar' });
                        }

                        // Menghapus file sementara setelah pengiriman
                        cleanupCallback();
                    });
                });
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
