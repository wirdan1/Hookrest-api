const axios = require('axios');

module.exports = function(app) {
    app.get('/dl/play', async (req, res) => {
        const { q } = req.query;
        if (!q) return res.status(400).json({ status: false, message: 'Query is required' });

        try {
            const response = await axios.get(`https://api.nekorinn.my.id/downloader/ytplay-savetube?q=${encodeURIComponent(q)}`, {
                validateStatus: () => true
            });

            const data = response.data;
            if (!data?.status || !data?.result) {
                return res.status(500).json({ status: false, message: 'Gagal mengambil data.' });
            }

            res.status(200).json({
                status: true,
                statusCode: 200,
                creator: "Danz-dev",
                result: data.result
            });
        } catch (err) {
            res.status(500).json({ status: false, message: 'Request error' });
        }
    });
};
