const axios = require('axios');

module.exports = function(app) {
    app.get('/info/listapi', (req, res) => {
        const list = [
            "Download YTMP3",
            "Download YTMP4",
            "Upscale Image",
            "Jadwal Sholat",
            "Asmaul Husna",
            "Gemini AI",
            "Spotify Downloader",
            "Lyrics Finder"
        ];

        res.json({
            status: true,
            creator: "Danz-dev",
            result: list
        });
    });
};
