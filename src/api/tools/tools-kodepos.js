const axios = require('axios');

module.exports = function(app) {
    async function getKodepos(form) {
        const apiUrl = `https://api.siputzx.my.id/api/tools/kodepos?form=${encodeURIComponent(form)}`;
        try {
            const res = await axios.get(apiUrl, {
                validateStatus: () => true
            });

            if (!res.data?.status || !res.data?.data?.length) {
                throw new Error(res.data?.message || 'Data tidak ditemukan.');
            }

            return res.data.data;
        } catch (error) {
            throw new Error(error.message || 'Gagal mengambil data.');
        }
    }

    app.get('/tools/kodepos', async (req, res) => {
        const { form } = req.query;
        if (!form) {
            return res.status(400).json({ status: false, error: 'Form parameter is required' });
        }

        try {
            const result = await getKodepos(form);
            res.status(200).json({ status: true, creator: 'Danz-dev', result });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
