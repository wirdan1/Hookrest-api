const axios = require('axios');

module.exports = function (app) {
    const yt = {
        baseUrl: 'https://ssvid.net',
        baseHeaders: {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'origin': 'https://ssvid.net',
            'referer': 'https://ssvid.net/youtube-to-mp3'
        },
        validateFormat(userFormat) {
            const validFormat = ['mp3', '360p', '720p', '1080p'];
            if (!validFormat.includes(userFormat)) {
                throw new Error(`invalid format!. available formats: ${validFormat.join(', ')}`);
            }
        },
        handleFormat(userFormat, searchJson) {
            this.validateFormat(userFormat);
            let result;
            if (userFormat === 'mp3') {
                result = searchJson.links?.mp3?.mp3128?.k;
            } else {
                const allFormats = Object.entries(searchJson.links.mp4);
                let selectedFormat = userFormat;
                const quality = allFormats
                    .map(v => v[1].q)
                    .filter(v => /\d+p/.test(v))
                    .map(v => parseInt(v))
                    .sort((a, b) => b - a)
                    .map(v => v + 'p');
                if (!quality.includes(userFormat)) selectedFormat = quality[0];
                const find = allFormats.find(v => v[1].q === selectedFormat);
                result = find?.[1]?.k;
            }
            if (!result) throw new Error(`${userFormat} gak ada`);
            return result;
        },
        async hit(path, payload) {
            try {
                const { data } = await axios.post(
                    `${this.baseUrl}${path}`,
                    new URLSearchParams(payload),
                    { headers: this.baseHeaders }
                );
                return data;
            } catch (e) {
                throw new Error(`${path}\n${e.message}`);
            }
        },
        async download(queryOrYtUrl, userFormat = 'mp3') {
            this.validateFormat(userFormat);

            let search = await this.hit('/api/ajax/search', { query: queryOrYtUrl, cf_token: '', vt: 'youtube' });
            if (search.p === 'search') {
                if (!search?.items?.length) throw new Error(`hasil pencarian ${queryOrYtUrl} tidak ada`);
                const { v } = search.items[0];
                const videoUrl = 'https://www.youtube.com/watch?v=' + v;
                search = await this.hit('/api/ajax/search', { query: videoUrl, cf_token: '', vt: 'youtube' });
            }
            const vid = search.vid;
            const k = this.handleFormat(userFormat, search);
            const convert = await this.hit('/api/ajax/convert', { k, vid });

            if (convert.c_status === 'CONVERTING') {
                let convert2;
                const limit = 5;
                let attempt = 0;
                do {
                    attempt++;
                    convert2 = await this.hit('/api/convert/check?hl=en', { vid, b_id: convert.b_id });
                    if (convert2.c_status === 'CONVERTED') return convert2;
                    await new Promise(r => setTimeout(r, 5000));
                } while (attempt < limit && convert2.c_status === 'CONVERTING');
                throw new Error('file belum siap / status belum diketahui');
            } else return convert;
        }
    };

    app.get('/api/ytdl', async (req, res) => {
        const { url, format } = req.query;

        if (!url || !format) {
            return res.status(400).json({
                status: false,
                error: 'Parameter "url" dan "format" diperlukan. contoh: /api/ytdl?format=mp3&url=https://youtube.be'
            });
        }

        try {
            const result = await yt.download(url, format);
            res.json({
                status: true,
                creator: 'Danz-dev',
                result
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                status: false,
                error: err.message
            });
        }
    });
};
