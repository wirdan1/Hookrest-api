const axios = require('axios');

module.exports = function(app) {
    app.get('/maker/bratvid', async (req, res) => {
        const { text } = req.query;
        if (!text) {
            return res.status(400).json({ status: false, error: 'Text is required' });
        }

        const apiUrl = `https://api.nekorinn.my.id/maker/bratvid?text=${encodeURIComponent(text)}`;

        try {
            const response = await axios.get(apiUrl, {
                responseType: 'arraybuffer',
                validateStatus: () => true
            });

            if (response.status !== 200) {
                throw new Error('Gagal mengambil video dari API bratvid.');
            }

            res.set('Content-Type', 'video/mp4');
            res.send(response.data);
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
