const axios = require('axios');

module.exports = function (app) {
    async function randomHadits() {
        try {
            const { data } = await axios.get('https://api.myquran.com/v2/hadits/arbain/semua');
            const datanya = data.data;
            const randomData = datanya[Math.floor(Math.random() * datanya.length)];

            return {
                sumber: "Scraper Hadits Arbain",
                nomor: randomData.no,
                judul: randomData.judul,
                teks_arab: randomData.arab,
                terjemahan: randomData.indo
            };
        } catch (error) {
            throw new Error("Gagal mengambil data");
        }
    }

    app.get('/islami/hadits', async (req, res) => {
        try {
            const result = await randomHadits();
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
