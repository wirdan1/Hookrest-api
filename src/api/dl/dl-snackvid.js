const axios = require('axios');
const qs = require('qs');
const cheerio = require('cheerio');

module.exports = function (app) {
    async function fetchSnackVideo(url) {
        const postData = qs.stringify({
            'ic-request': 'true',
            'id': url,
            'locale': 'id',
            'ic-element-id': 'main_page_form',
            'ic-id': '1',
            'ic-target-id': 'active_container',
            'ic-trigger-id': 'main_page_form',
            'ic-current-url': '/id/how-to-download-snack-video',
            'ic-select-from-response': '#id1',
            '_method': 'POST'
        });

        const config = {
            method: 'POST',
            url: 'https://getsnackvideo.com/results',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 8.1.0; CPH1803; Build/OPM1.171019.026) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.4280.141 Mobile Safari/537.36 KiToBrowser/124.0',
                'Accept': 'text/html-partial, */*; q=0.9',
                'accept-language': 'id-ID',
                'referer': 'https://getsnackvideo.com/id/how-to-download-snack-video',
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'x-ic-request': 'true',
                'x-http-method-override': 'POST',
                'x-requested-with': 'XMLHttpRequest',
                'origin': 'https://getsnackvideo.com',
                'alt-used': 'getsnackvideo.com',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'priority': 'u=0',
                'te': 'trailers',
                'Cookie': '_ga_TBLWJYRGPZ=GS1.1.1736227224.1.1.1736227279.0.0.0; _ga=GA1.1.1194697262.1736227224'
            },
            data: postData
        };

        const response = await axios.request(config);
        const $ = cheerio.load(response.data);
        return {
            thumbnail: $('.img_thumb img').attr('src') || null,
            downloadUrl: $('.download_link.without_watermark').attr('href') || null
        };
    }

    app.get('/download/snackvideo', async (req, res) => {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Parameter "url" diperlukan' });

        try {
            const result = await fetchSnackVideo(url);
            if (!result.downloadUrl) throw new Error('Gagal mengambil link unduhan.');

            res.json({
                status: true,
                creator: 'Danz-dev',
                result
            });
        } catch (err) {
            res.status(500).json({ status: false, creator: 'Danz-dev', error: err.message });
        }
    });
};
