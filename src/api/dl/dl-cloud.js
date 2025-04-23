module.exports = function(app) {
    const axios = require('axios');
    app.get('/dl/cloud', async (req, res) => {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ status: false, error: 'Query is required' });
        }
        try {
            const searchUrl = `https://www.velyn.biz.id/api/search/soundcloudsearch?query=${encodeURIComponent(q)}`;
            const searchRes = await axios.get(searchUrl);
            const list = searchRes.data?.data?.result;

            if (!list || list.length === 0) {
                return res.status(404).json({ status: false, error: 'Lagu tidak ditemukan.' });
            }

            const lagu = list[0];
            const downloadUrl = `https://www.velyn.biz.id/api/downloader/soundCloud?url=${encodeURIComponent(lagu.url)}`;
            const downloadRes = await axios.get(downloadUrl);

            res.status(200).json({
                status: true,
                result: {
                    title: lagu.title,
                    artist: lagu.artist,
                    views: lagu.timestamp,
                    thumbnail: lagu.thumb,
                    audio: downloadRes.data.data.audio
                }
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
}
