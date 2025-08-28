const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {
    app.get('/search/resep', async (req, res) => {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                status: false,
                error: 'Parameter "q" diperlukan.'
            });
        }

        try {
            // 🔍 Cari resep
            const { data } = await axios.get(`https://cookpad.com/id/cari/${encodeURIComponent(q)}`);
            const $ = cheerio.load(data);
            const recipes = [];

            const recipeLinks = [];

            $('li[id^="recipe_"]').each((index, element) => {
                const recipeId = $(element).attr('id').replace('recipe_', '');
                const url = `https://cookpad.com/id/resep/${recipeId}`;
                recipeLinks.push(url);
            });

            // 📄 Ambil detail tiap resep
            for (const url of recipeLinks) {
                try {
                    const { data: html } = await axios.get(url);
                    const $detail = cheerio.load(html);

                    const ldJsonScript = $detail('script[type="application/ld+json"]').toArray()
                        .map(el => {
                            try {
                                return JSON.parse($detail(el).text());
                            } catch {
                                return null;
                            }
                        })
                        .filter(json => json && json['@type'] === 'Recipe');

                    if (ldJsonScript.length === 0) continue;

                    const recipeLd = ldJsonScript[0];
                    let recipeData = {};

                    recipeData.id = recipeLd.url ? recipeLd.url.split('/').pop() : null;
                    recipeData.title = recipeLd.name || $detail('h1.break-words').text().trim();

                    if (recipeLd.author && recipeLd.author['@type'] === 'Person') {
                        recipeData.author = {
                            name: recipeLd.author.name,
                            username: $detail('a[href*="/pengguna/"] span[dir="ltr"]').first().text().trim() || null,
                            url: recipeLd.author.url
                        };
                    }

                    recipeData.imageUrl = recipeLd.image || $detail('meta[property="og:image"]').attr('content');
                    recipeData.description = recipeLd.description || $detail('meta[name="description"]').attr('content');
                    recipeData.servings = recipeLd.recipeYield || null;
                    recipeData.prepTime = $detail('div[id*="cooking_time_recipe_"] span.mise-icon-text').first().text().trim() || null;
                    recipeData.ingredients = recipeLd.recipeIngredient || [];
                    recipeData.steps = (recipeLd.recipeInstructions || []).map(step => ({
                        text: step.text,
                        images: step.image || []
                    }));
                    recipeData.datePublished = recipeLd.datePublished;
                    recipeData.dateModified = recipeLd.dateModified;

                    recipes.push(recipeData);
                } catch (err) {
                    console.error(`Gagal ambil detail: ${url}`, err.message);
                }
            }

            res.json({
                status: true,
                query: q,
                results: recipes
            });
        } catch (err) {
            res.status(500).json({
                status: false,
                error: 'Gagal mengambil data dari Cookpad.',
                message: err.message
            });
        }
    });
};
