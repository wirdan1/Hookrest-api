const { Jimp } = require('jimp');

module.exports = function (app) {
    app.get('/maker/pixelate', async (req, res) => {
        const { url, size1, size2 } = req.query;

        if (!url) {
            return res.status(400).json({
                status: false,
                error: 'Parameter "url" diperlukan.'
            });
        }

        let s1 = parseInt(size1) || 64;
        let s2 = parseInt(size2) || 256;

        try {
            const image = await Jimp.read(url);
            image
                .resize(s1, Jimp.AUTO, Jimp.RESIZE_NEAREST_NEIGHBOR)
                .resize(s2, Jimp.AUTO, Jimp.RESIZE_NEAREST_NEIGHBOR);

            const buffer = await image.getBuffer(Jimp.MIME_PNG);

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
