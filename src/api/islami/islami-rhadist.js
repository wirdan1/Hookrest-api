const axios = require('axios');

module.exports = function (app) {
    async function fetchRandomHadits() {
        try {
            const { data } = await axios.get('https://api.myquran.com/v2/hadits/arbain/semua');
            const list = data.data;
            const random = list[Math.floor(Math.random() * list.length)];

            return {
                sumber: "Scraper Hadits Arbain",
                nomor: random.no,
                judul: random.judul,
                teks_arab: random.arab,
                terjemahan: random.indo
            };
        } catch (error) {
            throw new Error("Gagal mengambil data hadits.");
        }
    }

    app.get('/islami/hadits/random', async (req, res) => {
        try {
            const result = await fetchRandomHadits();
            res.json({
                status: true,
                creator: "Danz-dev",
                result
            });
        } catch (err) {
            res.status(500).json({
                status: false,
                creator: "Danz-dev",
                error: err.message
            });
        }
    });
};
