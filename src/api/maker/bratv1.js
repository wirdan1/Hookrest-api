const axios = require('axios');
const fs = require('fs');

module.exports = function (app) {
    async function downloadBratImage(text) {
        const apiUrl = `https://brat.caliphdev.com/api/brat?text=${encodeURIComponent(text)}`;
        const filePath = 'brat_image.png';

        try {
            const response = await axios.get(apiUrl, {
                responseType: 'arraybuffer',
                validateStatus: () => true
            });

            if (response.status !== 200) {
                throw new Error(`Gagal mengambil gambar. Status: ${response.status}`);
            }

            fs.writeFileSync(filePath, response.data);
            return filePath;
        } catch (err) {
            throw new Error(err.message || 'Gagal mengambil data dari API brat.');
        }
    }

    app.get('/maker/brat', async (req, res) => {
        const { text } = req.query;
        if (!text) return res.status(400).json({ status: false, error: 'Text is required' });

        try {
            const imagePath = await downloadBratImage(text);
            res.sendFile(imagePath, err => {
                if (!err) {
                    fs.unlinkSync(imagePath);
                }
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
