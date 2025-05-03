const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = function (app) {
    async function downloadBratVideo(text) {
        const apiUrl = `https://api.nekorinn.my.id/maker/bratvid?text=${encodeURIComponent(text)}`;
        const filePath = path.join(__dirname, 'brat_video.bin');

        try {
            const response = await axios.get(apiUrl, {
                responseType: 'arraybuffer',
                validateStatus: () => true
            });

            if (response.status !== 200) {
                throw new Error(`Gagal mengambil video. Status: ${response.status}`);
            }

            fs.writeFileSync(filePath, response.data);
            return filePath;
        } catch (err) {
            throw new Error(err.message || 'Gagal mengambil video dari API bratvid.');
        }
    }

    app.get('/maker/bratvid', async (req, res) => {
        const { text } = req.query;
        if (!text) {
            return res.status(400).json({ status: false, creator: 'Danz-dev', error: 'Text is required' });
        }

        try {
            const videoPath = await downloadBratVideo(text);
            res.setHeader('Content-Type', 'video/mp4');
            res.sendFile(videoPath, err => {
                if (!err) {
                    fs.unlinkSync(videoPath);
                }
            });
        } catch (err) {
            res.status(500).json({ status: false, creator: 'Danz-dev', error: err.message });
        }
    });
};
