const axios = require('axios');

module.exports = function(app) {
    async function getDukun(content) {
        const apiUrl = `https://api.siputzx.my.id/api/ai/dukun?content=${encodeURIComponent(content)}`;
        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true
            });

            if (!res.data?.status || !res.data?.data) {
                throw new Error(res.data?.message || 'Gagal mendapatkan ramalan.');
            }

            return { message: res.data.data };
        } catch (error) {
            throw new Error(error.message || 'Gagal mengambil data.');
        }
    }

    app.get('/ai/dukun', async (req, res) => {
        const { content } = req.query;
        if (!content) {
            return res.status(400).json({ status: false, error: 'Content is required' });
        }

        try {
            const result = await getDukun(content);
            res.status(200).json({ status: true, creator: 'Danz-dev', result });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
