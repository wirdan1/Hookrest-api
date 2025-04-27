const axios = require('axios');

module.exports = function(app) {
    app.get('/info/listapi', (req, res) => {
        const list = [
            "YTMP3",
            "YTMP4",
            "Playstore",
            "Happymod",
            "Jadwal sholat",
            "Llama AI",
            "LuminAI",
            "Dukun Sakti",
            "Play",
            "Google Search",
            "Sound Cloud search",
            "Sound Cloud Download",
            "Tiktok download",
            "Cek Cuaca",
            "Kodepos",
            "Cek Khodam",
            "Tahukah",
            "Douyin",
            "Pinterest",
            "Gemini",
            "HydroMind",
            "Random ba",
            "Random loli",
            "YT SEARCH",
            "Brat",
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
