const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {
  async function scrapeCuacaBMKG(city = "Jakarta Pusat", area = "5015", prov = "6") {
    const url = `https://www.bmkg.go.id/cuaca/prakiraan-cuaca.bmkg?Kota=${encodeURIComponent(city)}&AreaID=${area}&Prov=${prov}`;

    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const cuacaData = [];

      $('.prakicu-kabkota').each((i, elem) => {
        const tanggal = $(elem).find('.kabkota-title').text().trim();
        const cuaca = $(elem).find('.kabkota-cuaca').text().trim();
        const suhu = $(elem).find('.kabkota-suhu').text().trim();
        const kelembapan = $(elem).find('.kabkota-lembab').text().trim();

        cuacaData.push({
          tanggal,
          cuaca,
          suhu,
          kelembapan
        });
      });

      return cuacaData;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Endpoint API
  app.get("/api/cuaca", async (req, res) => {
    const { city, area, prov } = req.query;

    if (!city || !area || !prov) {
      return res.status(400).json({
        status: false,
        error: 'Parameter "city", "area", dan "prov" wajib diisi.'
      });
    }

    try {
      const result = await scrapeCuacaBMKG(city, area, prov);
      res.json({
        status: true,
        creator: "Danz-dev",
        result
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        error: err.message
      });
    }
  });
};
