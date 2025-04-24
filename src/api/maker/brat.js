const axios = require('axios');

module.exports = function(app) {
    async function getBratText(text) {
        try {
            const url = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}`;
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

    app.get('/maker/brat', async (req, res) => {
        const { text } = req.query;

        if (!text) {
            return res.status(400).json({
                status: false,
                message: 'Text parameter is required'
            });
        }

        try {
            const bratResult = await getBratText(text);
            res.status(200).send(bratResult);
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message
            });
        }
    });
};
