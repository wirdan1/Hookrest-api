const { Jimp } = require('jimp');

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
                .resize(64, Jimp.AUTO, Jimp.RESIZE_NEAREST_NEIGHBOR) // kecilin
                .resize(256, Jimp.AUTO, Jimp.RESIZE_NEAREST_NEIGHBOR); // besarin lagi → pixelate otomatis

            const buffer = await image.getBuffer("image/png");

            res.set('Content-Type', 'image/png');
            res.send(buffer);
        } catch (err) {
            console.error(err);
            res.status(500).json({
                status: false,
                creator: "Danz-dev",
                error: 'Gagal memproses gambar, pastikan link valid!',
                message: err.message
            });
        }
    });
};
