const axios = require('axios');

module.exports = function (app) {
    async function fetchModdedData(query) {
        const searchUrl = `https://modded-by-yadi.blogspot.com/search?q=${encodeURIComponent(query)}`;

        try {
            const response = await axios.get(searchUrl);
            const html = response.data;
            const $ = require('cheerio').load(html);

            const articles = [];
            $('article.post.post-wrapper').each((_, element) => {
                const article = {
                    headline: $(element).find('h2.post-title.entry-title a').text().trim(),
                    link: $(element).find('h2.post-title.entry-title a').attr('href'),
                    imageSrc: $(element).find('img.post-thumbnail').attr('src'),
                    publishedDate: $(element).find('abbr.published.updated').attr('title'),
                };
                articles.push(article);
            });

            return articles;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw new Error('Gagal mengambil data dari website.');
        }
    }

    app.get('/apk/hookmod', async (req, res) => {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ status: false, error: 'Parameter "query" diperlukan' });
        }

        try {
            const result = await fetchModdedData(query);
            res.json({
                status: true,
                creator: "Danz-dev",
                data: result
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
