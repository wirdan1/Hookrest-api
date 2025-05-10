const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {
    async function fetchJadwalTV(channel) {
        try {
            const url = `https://www.jadwaltv.net/channel/${channel.toLowerCase()}`;
            const res = await axios.get(url);
            const $ = cheerio.load(res.data);

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
            return res.status(400).json({ status: false, error: 'Parameter "channel" diperlukan' });
        }

        try {
            const jadwal = await fetchJadwalTV(channel);
            if (!jadwal.length) {
                return res.status(404).json({ status: false, error: 'Tidak ada jadwal ditemukan' });
            }

            res.json({
                status: true,
                creator: "Danz-dev",
                channel: channel.toUpperCase(),
                data: jadwal
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
