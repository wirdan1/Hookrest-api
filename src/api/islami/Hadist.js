const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {
    app.get('/islami/hadist', async (req, res) => {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ status: false, message: 'Parameter ?q diperlukan (misal: ?q=bukhari)' });
        }

        try {
            const { data } = await axios.get(`https://www.hadits.id/tentang/${encodeURIComponent(q)}`);
            const $ = cheerio.load(data);
            const section = $('section').first();

            if (!section.length) {
                return res.status(404).json({ status: false, message: 'Hadist tidak ditemukan.' });
            }

            const judul = section.find('a').text().trim();
            const link = 'https://www.hadits.id' + section.find('a').attr('href');
            const perawi = section.find('.perawi').text().trim();
            const kitab = section.find('cite').text().replace(perawi, '').trim();
            const teks = section.find('p').text().trim();

            // Fetch detail langsung
            const detailPage = await axios.get(link);
            const _$ = cheerio.load(detailPage.data);

            const title = _$('#article h1').text().trim();
            const haditsArab = _$('#article p.rtl').text().trim();
            const hadithNumberMatch = _$('#article header .hadits-about h2').text().match(/No. (\d+)/);
            const hadithNumber = hadithNumberMatch ? hadithNumberMatch[1] : null;

            res.json({
                status: true,
                source: q,
                judul,
                perawi,
                kitab,
                teks,
                detail: {
                    title,
                    haditsArab,
                    hadithNumber
                }
            });
        } catch (err) {
            res.status(500).json({ status: false, message: err.message });
        }
    });
};
