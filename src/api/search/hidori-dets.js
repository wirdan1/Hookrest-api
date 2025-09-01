const axios = require("axios");
const cheerio = require("cheerio");

module.exports = function (app) {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
    Referer: "https://hidoristream.com/",
  };

  async function getAnimeDetail(url) {
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);

    const detail = {};
    detail.title = $(".infox h1.entry-title").text().trim();
    detail.alternativeTitle = $(".infox .alter").text().trim();
    detail.image = $(".thumbook img").attr("src");
    detail.synopsis = $(".bixbox.synp .entry-content p").text().trim();

    detail.genres = $(".infox .genxed a")
      .map((i, el) => $(el).text().trim())
      .get();

    detail.episodes = [];
    $(".bixbox.bxcl.epcheck .eplister ul li").each((_, el) => {
      const $li = $(el);
      const $link = $li.find("a");
      if ($link.length > 0) {
        detail.episodes.push({
          number: $li.find(".epl-num").text().trim(),
          title: $li.find(".epl-title").text().trim(),
          url: $link.attr("href"),
          releaseDate: $li.find(".epl-date").text().trim(),
        });
      }
    });

    return detail;
  }

  app.get("/api/hidori/detail", async (req, res) => {
    const { url } = req.query;
    if (!url)
      return res.status(400).json({ status: false, error: "URL diperlukan" });

    try {
      const data = await getAnimeDetail(url);
      res.json({ status: true, detail: data });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  });
};
