const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Buat nama file random

module.exports = function(app) {
    app.get('/tools/remini', async (req, res) => {
        const { image } = req.query;
        if (!image) {
            return res.status(400).json({ status: false, error: 'Image URL is required' });
        }

        const apiUrl = `https://api.siputzx.my.id/api/iloveimg/upscale?image=${encodeURIComponent(image)}`;

        try {
            const tmpFilename = path.join(__dirname, '../tmp', `${uuidv4()}.jpg`);

            const response = await axios.get(apiUrl, {
                responseType: 'stream',
                validateStatus: () => true
            });

            if (response.status !== 200) {
                throw new Error('Gagal mengambil gambar dari API Upscale.');
            }

            const writer = fs.createWriteStream(tmpFilename);
            response.data.pipe(writer);

            writer.on('finish', () => {
                res.sendFile(tmpFilename, (err) => {
                    fs.unlinkSync(tmpFilename); // Hapus file tmp setelah kirim
                    if (err) {
                        console.error('Gagal kirim file:', err);
                    }
                });
            });

            writer.on('error', (err) => {
                throw new Error('Gagal menulis file sementara.');
            });

        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
