const axios = require('axios'); 
module.exports = function(app) { 
    async function downloadPlaycloud(url) { 
        try { 
            const downloadUrl = `https://www.velyn.biz.id/api/downloader/soundCloud?url=${encodeURIComponent(url)}`; 
            const { data } = await axios.get(downloadUrl); 
            if (!data || !data.data || !data.data.url) throw new Error('Gagal mendapatkan link download.'); 
            return data; 
        } catch (error) { 
            throw error; 
        } 
    } 
    app.get('/dl/soundcloud', async (req, res) => { 
        const { url } = req.query; 
        if (!url) return res.status(400).json({ status: false, error: 'URL is required' }); 
        try { 
            const result = await downloadPlaycloud(url); 
            res.status(200).json(result); 
        } catch (error) { 
            res.status(500).json({ status: false, error: error.message }); 
        } 
    }); 
};
