const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.get('/dl/tiktok', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ status: false, error: 'URL is required' });
    }

    try {
        const api = `https://api.siputzx.my.id/api/tiktok/v2?url=${encodeURIComponent(url)}`;
        const response = await axios.get(api);
        const data = response.data;

        if (!data?.success || !data?.data) {
            throw new Error('Video tidak ditemukan atau API gagal merespon.');
        }

        res.status(200).json({
            status: true,
            creator: 'Danz-dev',
            metadata: data.data.metadata,
            downloads: data.data.download,
            postId: data.postId
        });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
