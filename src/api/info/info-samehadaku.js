const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {
    async function fetchAnimeTerbaru() {
        const url = 'https://samehadaku.mba/anime-terbaru/';

        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const $ = cheerio.load(response.data);
            const animeList = [];

            $('.post-show ul li').each((_, el) => {
                const title = $(el).find('.dtla h2.entry-title a').text().trim();
                const link = $(el).find('.dtla h2.entry-title a').attr('href');
                const episode = $(el).find('.dtla span').eq(0).find('author[itemprop="name"]').text().trim();
                const releaseTime = $(el).find('.dtla span').eq(2).text().replace('Released on: ', '').trim();
                const thumbnail = $(el).find('.thumb img').attr('src');

                if (title && link) {
                    animeList.push({ title, link, episode, releaseTime, thumbnail });
                }
            });

            return animeList;
        } catch (error) {
            throw new Error('Gagal mengambil data dari Samehadaku.');
        }
    }

    app.get('/info/samehadaku', async (req, res) => {
        try {
            const result = await fetchAnimeTerbaru();
            res.json({
                status: true,
                creator: "Danz-dev",
                anime: result
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
