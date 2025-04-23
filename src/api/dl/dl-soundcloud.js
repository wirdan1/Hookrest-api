const axios = require('axios'); 
module.exports = function(app) { 
    async function downloadPlaycloud(url) { 
        try { 
            const downloadUrl = `https://www.velyn.biz.id/api/downloader/soundCloud?url=${encodeURIComponent(url)}`; 
            const { data } = await axios.get(downloadUrl); 
            if (!data?.data?.url) throw new Error(data?.message || 'Gagal mendapatkan link download.'); 
            return data.data; 
        } catch (error) { 
            throw new Error(error.response?.data?.message || error.message); 
        } 
    } 
    app.get('/download/playcloud', async (req, res) => { 
        const { url } = req.query; 
        if (!url) return res.status(400).json({ status: false, error: 'URL is required' }); 
        try { 
            const result = await downloadPlaycloud(url); 
            res.status(200).json({ status: true, creator: 'Velyn', result }); 
        } catch (error) { 
            res.status(500).json({ status: false, error: error.message }); 
        } 
    }); 
};
