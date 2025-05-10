const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {
    async function fetchJadwalTV(channel) {
        const url = `https://www.jadwaltv.net/channel/${channel.toLowerCase()}`;
        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            let hasil = [];

            $('table tbody tr').each((i, el) => {
                const jam = $(el).find('td').eq(0).text().trim();
                const acara = $(el).find('td').eq(1).text().trim();

                if (jam && acara && jam.toLowerCase() !== 'jam' && acara.toLowerCase() !== 'acara') {
                    hasil.push({ jam, acara });
                }
            });

            return hasil;
        } catch (err) {
            throw new Error('Gagal mengambil data atau channel tidak ditemukan.');
        }
    }

    app.get('/info/jadwaltv', async (req, res) => {
        const { channel } = req.query;
        if (!channel) {
            return res.status(400).json({ status: false, error: 'Parameter "channel" diperlukan.' });
        }

        try {
            const result = await fetchJadwalTV(channel);
            if (result.length === 0) {
                return res.status(404).json({ status: false, error: 'Channel tidak ditemukan atau tidak ada jadwalnya.' });
            }

            res.json({
                status: true,
                creator: 'Danz-dev',
                channel: channel.toUpperCase(),
                total: result.length,
                jadwal: result
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
