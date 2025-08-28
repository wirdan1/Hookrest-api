const axios = require('axios');
const Jimp = require('jimp');

module.exports = function (app) {
    app.get('/maker/pixelate', async (req, res) => {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                status: false,
                error: 'Parameter "url" diperlukan.'
            });
        }

        try {
            const image = await Jimp.read(url);
            image
                .resize(64, Jimp.AUTO, Jimp.RESIZE_NEAREST_NEIGHBOR)
                .resize(256, Jimp.AUTO, Jimp.RESIZE_NEAREST_NEIGHBOR);

            const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

            res.set('Content-Type', 'image/png');
            res.send(buffer);
        } catch (err) {
            console.error(err);
            res.status(500).json({
                status: false,
                error: 'Gagal memproses gambar, pastikan link valid!',
                message: err.message
            });
        }
    });
};
