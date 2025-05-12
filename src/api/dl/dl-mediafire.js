const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {
    async function mediaFireScrape(url) {
        try {
            const response = await axios.get('https://r.jina.ai/' + url, {
                headers: { 'x-return-format': 'html' }
            });

            const $ = cheerio.load(response.data);
            const timeMatch = $('div.DLExtraInfo-uploadLocation div.DLExtraInfo-sectionDetails')
                .text()
                .match(/This file was uploaded from (.*?) on (.*?) at (.*?)\n/);

            const result = {
                title: $('div.dl-btn-label').text().trim(),
                link: $('div.dl-utility-nav a').attr('href'),
                filename: $('div.dl-btn-label').attr('title'),
                url: $('a#downloadButton').attr('href'),
                size: $('a#downloadButton').text().match(/(.*?)/)?.[1] || null,
                from: timeMatch?.[1] || null,
                date: timeMatch?.[2] || null,
                time: timeMatch?.[3] || null,
                map: {
                    background: "https://static.mediafire.com/images/backgrounds/download/additional_content/world.svg",
                    region: `https://static.mediafire.com/images/backgrounds/download/additional_content/${$('div.DLExtraInfo-uploadLocationRegion').attr('data-lazyclass')}.svg`
                },
                repair: $('a.retry').attr('href') || null
            };

            return result;
        } catch (error) {
            throw new Error(error.message || 'Gagal mengambil data MediaFire.');
        }
    }

    app.get('/api/mediafire', async (req, res) => {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({
                status: false,
                error: 'Parameter "url" diperlukan'
            });
        }

        try {
            const result = await mediaFireScrape(url);
            res.json({
                status: true,
                creator: 'Danz-dev',
                result
            });
        } catch (err) {
            res.status(500).json({
                status: false,
                creator: 'Danz-dev',
                error: err.message
            });
        }
    });
};
