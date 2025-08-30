const axios = require('axios');

module.exports = function (app) {
    const ytdown = {
        api: {
            base: "https://p.oceansaver.in/ajax/",
            progress: "https://p.oceansaver.in/ajax/progress.php"
        },
        headers: {
            'authority': 'p.oceansaver.in',
            'origin': 'https://y2down.cc',
            'referer': 'https://y2down.cc/',
            'user-agent': 'Postify/1.0.0'
        },
        silent: process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production',

        isUrl: str => {
            try { new URL(str); return true; } catch { return false; }
        },

        youtube: url => {
            if (!url) return null;
            const patterns = [
                /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
                /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
                /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
                /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
                /youtu\.be\/([a-zA-Z0-9_-]{11})/
            ];
            for (let p of patterns) {
                const match = url.match(p);
                if (match) return match[1];
            }
            return null;
        },

        request: async (endpoint, params = {}) => {
            const { data } = await axios.get(`${ytdown.api.base}${endpoint}`, {
                params,
                headers: ytdown.headers,
                withCredentials: true,
                responseType: 'json'
            });
            return data;
        },

        download: async (link, format) => {
            if (!link) throw new Error("Parameter 'url' diperlukan 🗿");
            if (!ytdown.isUrl(link)) throw new Error("Link bukan YouTube 🗿");

            const id = ytdown.youtube(link);
            if (!id) throw new Error("Gagal ekstrak ID YouTube 😂");

            const response = await ytdown.request("download.php", {
                format,
                url: `https://www.youtube.com/watch?v=${id}`
            });

            return await ytdown.handler(response, format, id);
        },

        handler: async (data, format, id) => {
            if (!data.success) throw new Error(data.message || "Error");
            if (!data.id) throw new Error("ID Download tidak ada 😂");

            const pr = await ytdown.checkProgress(data.id);
            if (pr.success) return ytdown.final(data, pr, format, id);
            throw new Error(pr.error || "Unknown error");
        },

        checkProgress: async (id) => {
            let attempts = 0;
            while (attempts < 100) {
                try {
                    const res = await axios.get(ytdown.api.progress, {
                        params: { id },
                        headers: ytdown.headers,
                        withCredentials: true,
                        responseType: 'json'
                    });
                    const data = res.data;

                    if (data.success && data.download_url) return { success: true, ...data };
                } catch (e) {
                    // ignore error, retry
                }

                await new Promise(r => setTimeout(r, 1000));
                attempts++;
            }
            return { success: false, error: "Timeout, gagal ambil link download 😂" };
        },

        final: (init, pro, format, id) => ({
            success: true,
            title: init.title || "Unknown 🤷🏻",
            type: format === 'mp3' ? 'audio' : 'video',
            format,
            thumbnail: init.info?.image || `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
            download: pro.download_url || null,
            id
        })
    };

    // Endpoint MP3
    app.get('/api/ytmp3', async (req, res) => {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Parameter "url" diperlukan' });

        try {
            const result = await ytdown.download(url, 'mp3');
            res.json({ status: true, creator: 'Danz-dev', result });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });

    // Endpoint MP4 720p
    app.get('/api/ytmp4', async (req, res) => {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Parameter "url" diperlukan' });

        try {
            const result = await ytdown.download(url, '720'); // fix 720p
            res.json({ status: true, creator: 'Danz-dev', result });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
