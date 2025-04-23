const axios = require('axios');

module.exports = function(app) {
    async function getDouyin(url) {
        try {
            const api = `https://api.siputzx.my.id/api/d/douyin?url=${encodeURIComponent(url)}`;
            const res = await axios.get(api);
            const data = res.data;

            if (!data?.status || !data?.data) {
                throw new Error('Video tidak ditemukan.');
            }

            return data.data;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    app.get('/dl/douyin', async (req, res) => {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ status: false, error: 'URL is required' });
        }

        try {
            const result = await getDouyin(url);
            res.status(200).json({
                status: true,
                creator: 'Danz-dev',
                title: result.title,
                thumbnail: result.thumbnail,
                downloads: result.downloads,
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
