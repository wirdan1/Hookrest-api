const axios = require('axios');

module.exports = function(app) {
    async function getJadwalTV() {
        try {
            const url = 'https://api.siputzx.my.id/api/info/jadwaltv';
            const res = await axios.get(url);
            const data = res.data;

            if (!data?.status || !data?.data) {
                throw new Error('Data tidak tersedia.');
            }

            return data.data;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    app.get('/info/jadwaltv', async (req, res) => {
        try {
            const jadwalTV = await getJadwalTV();
            res.status(200).json({
                status: true,
                creator: 'Danz-dev',
                result: jadwalTV
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message
            });
        }
    });
};
