const axios = require('axios');

module.exports = function(app) {
    app.get('/tools/remini', async (req, res) => {
        const { image } = req.query;
        if (!image) {
            return res.status(400).json({ status: false, error: 'Image URL is required' });
        }

        const apiUrl = `https://api.siputzx.my.id/api/iloveimg/upscale?image=${encodeURIComponent(image)}`;

        try {
            const response = await axios.get(apiUrl, {
                responseType: 'arraybuffer', // Karena mau ambil file/gambar langsung
                validateStatus: () => true
            });

            // Cek kalo gagal
            if (response.status !== 200) {
                throw new Error('Gagal mengambil gambar dari API Upscale.');
            }

            // Set header agar browser tahu ini gambar
            res.set('Content-Type', 'image/jpeg');
            res.send(response.data);
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
