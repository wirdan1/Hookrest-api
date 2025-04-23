const axios = require('axios'); 
module.exports = function(app) { 
    async function searchPlaycloud(q) { 
        try { 
            const searchUrl = `https://www.velyn.biz.id/api/search/soundcloudsearch?query=${encodeURIComponent(q)}`; 
            const searchRes = await axios.get(searchUrl); 
            const list = searchRes.data?.data?.result; 
            if (!list || list.length === 0) throw new Error('Lagu tidak ditemukan.'); 
            const formattedResults = list.map(item => { 
                const durationMatch = item.artist.match(/(\d+:\d+)/); 
                const viewsMatch = item.artist.match(/([\d.]+[KM]?)\s*\d+:\d+/); 
                const artistMatch = item.artist.replace(/[\d.]+[KM]?\s*\d+:\d+\w*/g, '').trim(); 
                return { 
                    title: item.title, 
                    url: item.url, 
                    thumb: item.thumb, 
                    artist: artistMatch || null, 
                    views: viewsMatch ? viewsMatch[1] : null, 
                    duration: durationMatch ? durationMatch[1] : null, 
                    timestamp: item.timestamp || null 
                }; 
            }); 
            return { 
                status: true, 
                creator: 'Velyn', 
                data: { 
                    status: 200, 
                    creator: 'Velyn', 
                    result: formattedResults 
                } 
            }; 
        } catch (error) { 
            throw error; 
        } 
    } 
    app.get('/search/cloud', async (req, res) => { 
        const { q } = req.query; 
        if (!q) return res.status(400).json({ status: false, error: 'Query is required' }); 
        try { 
            const result = await searchPlaycloud(q); 
            res.status(200).json(result); 
        } catch (error) { 
            res.status(500).json({ status: false, error: error.message }); 
        } 
    }); 
};
