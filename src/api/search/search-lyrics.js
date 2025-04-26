module.exports = function(app) {
    const fetch = require('node-fetch');
    
    app.get('/search/lyrics', async (req, res) => {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ status: false, error: 'Query is required' });
        }
        try {
            const response = await fetch(`https://some-random-api.com/lyrics?title=${encodeURIComponent(q)}`);
            const json = await response.json();
            const data = json.result;

            if (!data || !data.status || !data.lirik) {
                return res.status(404).json({ status: false, error: 'Lyrics not found' });
            }

            res.status(200).json({
                status: true,
                result: {
                    title: data.judul,
                    artist: data.artis,
                    album: data.album,
                    lyrics: data.lirik
                }
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
