const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = function (app) {
    async function getBratVideo(text, delay = 500) {
        const apiUrl = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}&isVideo=true&delay=${delay}`;
        const filePath = path.join('/tmp', `bratvideo_${Date.now()}.mp4`);

        try {
            const response = await axios.get(apiUrl, {
                responseType: 'arraybuffer',
                validateStatus: () => true
            });

            if (response.status !== 200) {
                throw new Error(`Gagal mendapatkan video. Status: ${response.status}`);
            }

            fs.writeFileSync(filePath, response.data);
            return filePath;
        } catch (err) {
            throw new Error(err.message || 'Gagal mengambil video dari API Brat.');
        }
    }

    app.get('/maker/bratvid', async (req, res) => {
        const { text, delay } = req.query;
        if (!text) return res.status(400).json({ status: false, creator: 'Danz-dev', error: 'Text is required' });

        try {
            const videoPath = await getBratVideo(text, delay);
            res.sendFile(videoPath, err => {
                if (!err) fs.unlinkSync(videoPath);
            });
        } catch (err) {
            res.status(500).json({ status: false, creator: 'Danz-dev', error: err.message });
        }
    });
};
