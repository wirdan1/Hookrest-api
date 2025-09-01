const axios = require('axios');
const yts = require('yt-search');

module.exports = function(app) {
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
        download: async (link) => {
            const id = ytdown.youtube(link);
            if (!id) throw new Error("Gagal ekstrak ID YouTube");
            const response = await ytdown.request("download.php", {
                format: 'mp3',
                url: `https://www.youtube.com/watch?v=${id}`
            });
            if (!response.success) throw new Error(response.message || "Error");
            const pr = await ytdown.checkProgress(response.id);
            if (!pr.success) throw new Error(pr.error || "Gagal ambil link download");
            return {
                title: response.title || "Unknown",
                id,
                thumbnail: response.info?.image || `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
                download: pr.download_url
            };
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
                    if (res.data.success && res.data.download_url) return { success: true, download_url: res.data.download_url };
                } catch {}
                await new Promise(r => setTimeout(r, 1000));
                attempts++;
            }
            return { success: false, error: "Timeout, gagal ambil link download" };
        }
    };

    app.get('/dl/yt/play', async (req, res) => {
        const { query } = req.query;
        if (!query) return res.status(400).json({ status: false, error: "Parameter 'query' diperlukan" });

        try {
            // Cari video pertama
            const searchResult = await yts(query);
            const video = searchResult.videos[0];
            if (!video) return res.status(404).json({ status: false, error: "Video tidak ditemukan" });

            // Download mp3
            const mp3 = await ytdown.download(video.url);

            res.json({
                status: true,
                creator: "Danz-dev",
                result: {
                    video: {
                        url: video.url,
                        description: video.description,
                        duration: video.timestamp,
                        views: video.views,
                    },
                    mp3
                }
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
