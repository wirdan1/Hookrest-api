const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {

    async function hadist(hadist) {
        try {
            const { data: leet } = await axios.get(`https://www.hadits.id/tentang/${hadist}`);
            const $ = cheerio.load(leet);

            let hasil = [];
            $('section').each((i, el) => {
                let judul = $(el)
                    .find('a')
                    .text()
                    .trim();
                let link = `https://www.hadits.id${$(el).find('a').attr('href')}`;
                let perawi = $(el)
                    .find('.perawi')
                    .text()
                    .trim();
                let kitab = $(el)
                    .find('cite')
                    .text()
                    .replace(perawi, '')
                    .trim();
                let teks = $(el)
                    .find('p')
                    .text()
                    .trim();

                hasil.push({
                    judul,
                    link,
                    perawi,
                    kitab,
                    teks
                });
            });

            return hasil;
        } catch (error) {
            throw new Error('Gagal mengambil data dari Hadits.');
        }
    }

    async function detail(url) {
        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);

            const title = $('article h1')
                .text()
                .trim();
            const breadcrumb = [];
            $('div.breadcrumb-menu ol.breadcrumbs li').each((index, element) => {
                breadcrumb.push($(element).text().trim());
            });

            const hadithContent = $('article p.rtl')
                .text()
                .trim();
            const hadithNumber = $('header .hadits-about h2')
                .text()
                .match(/No. (\d+)/)[1];

            return {
                title,
                breadcrumb,
                haditsArab: hadithContent,
                hadithNumber
            };
        } catch (error) {
            throw new Error('Gagal mengambil detail Hadits.');
        }
    }

    // Gabungkan kedua fungsi dalam satu route
    app.get('/islami/hadist', async (req, res) => {
        const { hadist, url } = req.query;

        if (!hadist && !url) {
            return res.status(400).json({ status: false, error: 'Parameter "hadist" atau "url" diperlukan' });
        }

        try {
            let result;

            // Tentukan apakah akan menggunakan fungsi hadist atau detail
            if (hadist) {
                result = await hadist(hadist);
                return res.json({
                    status: true,
                    creator: "Danz-dev",
                    media: result
                });
            }

            if (url) {
                result = await detail(url);
                return res.json({
                    status: true,
                    creator: "Danz-dev",
                    detail: result
                });
            }

        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
