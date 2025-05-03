const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const stream = require('stream');

module.exports = function (app) {
    async function downloadBratVideo(text) {
        const apiUrl = `https://api.nekorinn.my.id/maker/bratvid?text=${encodeURIComponent(text)}`;

        try {
            const response = await axios.get(apiUrl, {
                responseType: 'stream', // Mendapatkan data sebagai stream
                validateStatus: () => true
            });

            if (response.status !== 200) {
                throw new Error(`Gagal mengambil video. Status: ${response.status}`);
            }

            return response.data; // Mengembalikan stream video
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
            const videoStream = await downloadBratVideo(text);

            res.setHeader('Content-Type', 'video/mp4'); // Atur sesuai format video yang diberikan oleh API
            res.setHeader('Content-Disposition', 'inline; filename="bratvid.vid"'); // Menggunakan .vid

            // Pipe stream video ke response
            await pipeline(videoStream, res);
        } catch (err) {
            res.status(500).json({ status: false, creator: 'Danz-dev', error: err.message });
        }
    });
};
