const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = function (app) {
    async function downloadBratImage(text) {
        const apiUrl = `https://brat.caliphdev.com/api/brat?text=${encodeURIComponent(text)}`;
        const filePath = '/tmp/brat_image.png'; // Menggunakan direktori /tmp di Vercel

        try {
            // Mendapatkan gambar dari API brat
            const response = await axios.get(apiUrl, {
                responseType: 'arraybuffer',
                validateStatus: () => true
            });

            if (response.status !== 200) {
                throw new Error(`Gagal mengambil gambar. Status: ${response.status}`);
            }

            // Menyimpan file sementara di /tmp
            fs.writeFileSync(filePath, response.data);
            return filePath;
        } catch (err) {
            throw new Error(err.message || 'Gagal mengambil data dari API brat.');
        }
    }

    app.get('/maker/brat', async (req, res) => {
        const { text } = req.query;
        if (!text) return res.status(400).json({ status: false, creator: 'Danz-dev', error: 'Text is required' });

        try {
            const imagePath = await downloadBratImage(text);
            res.sendFile(imagePath, err => {
                if (!err) {
                    fs.unlinkSync(imagePath); // Menghapus file setelah dikirim
                }
            });
        } catch (err) {
            res.status(500).json({ status: false, creator: 'Danz-dev', error: err.message });
        }
    });
};
