const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {
    async function fetchSchedule(day = 'today') {
        try {
            let tanggal = new Date();
            if (day === 'tomorrow') tanggal.setDate(tanggal.getDate() + 1);

            const format_tg = tanggal.toISOString().split('T')[0].replace(/-/g, '');
            const { data } = await axios.get(`https://www.espn.com/soccer/schedule/_/date/${format_tg}`);
            const $ = cheerio.load(data);
            const hasil = [];
            let liga = '';

            $('.Table__Title, .Table__TBODY .Table__TR').each((_, el) => {
                if ($(el).hasClass('Table__Title')) {
                    liga = $(el).text().trim();
                } else {
                    const kolore = $(el).find('.Table__TD');
                    const tim1 = kolore.eq(0).text().trim();
                    const tim2 = kolore.eq(1).find('span').last().text().trim();
                    const score = tim1 + ' ' + kolore.eq(1).text().trim();
                    
                    const item = {
                        liga,
                        team1: tim1,
                        team2: tim2,
                        time: kolore.eq(2).text().trim() || '-',
                        location: kolore.eq(day === 'today' ? 3 : 4).text().trim() || '-',
                        source: kolore.eq(0).find('a').attr('href') ? 'https://www.espn.com' + kolore.eq(0).find('a').attr('href') : 'Gak ada',
                        detail: kolore.eq(1).find('a').attr('href') ? 'https://www.espn.com' + kolore.eq(1).find('a').attr('href') : 'Gak ada'
                    };

                    if (day === 'today' && score.includes('-')) {
                        item.score = score;
                    }

                    if (tim1 && tim2) hasil.push(item);
                }
            });

            return {
                status: true,
                date: tanggal.toISOString().split('T')[0],
                total: hasil.length,
                data: hasil
            };
        } catch (err) {
            throw new Error('Gagal mengambil data jadwal bola.');
        }
    }

    app.get('/info/jadwalbola', async (req, res) => {
        const { day } = req.query; // today / tomorrow
        if (day !== 'today' && day !== 'tomorrow') {
            return res.status(400).json({ status: false, error: 'Gunakan query ?day=today atau ?day=tomorrow' });
        }

        try {
            const result = await fetchSchedule(day);
            res.json({
                status: true,
                creator: "Danz-dev",
                ...result
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
