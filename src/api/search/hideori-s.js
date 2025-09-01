const axios = require("axios");
const cheerio = require("cheerio");

module.exports = function (app) {
  const baseUrl = "https://hidoristream.com";
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
    Referer: "https://hidoristream.com/",
  };

  async function searchAnime(query) {
    const searchUrl = `${baseUrl}/?s=${encodeURIComponent(query)}`;
    const response = await axios.get(searchUrl, { headers });
    const $ = cheerio.load(response.data);

    const results = [];
    $(".listupd article.bs").each((_, element) => {
      const $item = $(element);
      const $link = $item.find("a.tip");
      const animeUrl = $link.attr("href");
      const animeTitle = $link.attr("title");
      if (!animeUrl || !animeTitle) return;

      const $img = $item.find("img.ts-post-image");
      results.push({
        title: animeTitle,
        url: animeUrl,
        image: $img.attr("src"),
        type: $item.find(".typez").text().trim(),
        status: $item.find(".bt .epx").text().trim(),
        isHot: $item.find(".hotbadge").length > 0,
      });
    });
    return results;
  }

  app.get("/api/hidori/search", async (req, res) => {
    const { query } = req.query;
    if (!query)
      return res.status(400).json({ status: false, error: "Query diperlukan" });

    try {
      const data = await searchAnime(query);
      res.json({ status: true, results: data });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  });
};
