module.exports = function(app) {
    const fetch = require('node-fetch');
    const cheerio = require('cheerio');

    async function douyinDownloader(url) {
        const apiUrl = "https://lovetik.app/api/ajaxSearch";
        const formBody = new URLSearchParams();
        formBody.append("q", url);
        formBody.append("lang", "id");

        const res = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Accept": "*/*",
                "X-Requested-With": "XMLHttpRequest"
            },
            body: formBody.toString()
        });

        const data = await res.json();
        if (data.status !== "ok") throw new Error("Gagal mengambil data Douyin.");

        const $ = cheerio.load(data.data);
        const title = $("h3").text();
        const thumbnail = $(".image-tik img").attr("src");
        const duration = $(".content p").text();
        const dl = [];

        $(".dl-action a").each((i, el) => {
            dl.push({
                text: $(el).text().trim(),
                url: $(el).attr("href")
            });
        });

        return { title, thumbnail, duration, dl };
    }

    app.get('/dl/douyin', async (req, res) => {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ status: false, error: 'URL is required' });
        }

        try {
            const result = await douyinDownloader(url);
            res.status(200).json({
                status: true,
                result
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
