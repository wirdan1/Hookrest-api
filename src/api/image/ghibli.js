const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = function (app) {
    const base = 'https://ghibli-image-generator.com';
    const imageBase = 'https://imgs.ghibli-image-generator.com';
    const endpoints = {
        fileExists: '/api/trpc/uploads.chatFileExists?batch=1',
        signed: '/api/trpc/uploads.signedUploadUrl?batch=1',
        create: '/api/trpc/ai.create4oImage?batch=1',
        task: '/api/trpc/ai.getTaskInfo?batch=1'
    };

    const headers = {
        'authority': 'ghibli-image-generator.com',
        'accept': 'application/json',
        'content-type': 'application/json',
        'origin': base,
        'referer': `${base}/`,
        'user-agent': 'Postify/1.0.0'
    };

    const axiosInstance = axios.create({
        timeout: 30000,
        validateStatus: status => status >= 200 && status < 300
    });

    async function getSignedUrl(hashx) {
        try {
            const res = await axiosInstance.post(`${base}${endpoints.signed}`, {
                "0": { "json": { path: hashx, bucket: "ghibli-image-generator" } }
            }, { headers });

            console.log('getSignedUrl response:', res.data);
            return res.data[0]?.result?.data?.json;
        } catch (err) {
            console.error('[getSignedUrl ERROR]', err.message);
            throw new Error('Gagal mendapatkan signed URL');
        }
    }

    async function uploadFile(signedUrl, fileBuffer, mime) {
        try {
            const res = await axios.put(signedUrl, fileBuffer, {
                headers: { 'Content-Type': mime }
            });
            console.log('uploadFile response:', res.status);
            return res;
        } catch (err) {
            console.error('[uploadFile ERROR]', err.message);
            throw new Error('Gagal mengupload file');
        }
    }

    async function processImage(imageUrl, prompt = "restyle image in studio ghibli style, keep all details", size = "1:1") {
        try {
            const res = await axiosInstance.post(`${base}${endpoints.create}`, {
                "0": { "json": { imageUrl, prompt, size } }
            }, { headers });

            console.log('processImage response:', res.data);
            const taskId = res.data[0]?.result?.data?.json?.data?.taskId;
            if (!taskId) throw new Error('Gagal mendapatkan task ID.');
            return taskId;
        } catch (err) {
            console.error('[processImage ERROR]', err.message);
            throw new Error('Gagal memproses gambar');
        }
    }

    async function waitForTask(taskId) {
        let attempts = 0;
        while (attempts < 30) {
            try {
                const res = await axiosInstance.get(`${base}${endpoints.task}`, {
                    params: {
                        input: JSON.stringify({ "0": { json: { taskId } } })
                    },
                    headers
                });

                console.log('waitForTask response:', res.data);
                const data = res.data[0]?.result?.data?.json?.data;
                if (data.status === 'SUCCESS' && data.successFlag === 1) {
                    return data.response.resultUrls[0];
                } else if (['FAILED', 'GENERATE_FAILED'].includes(data.status)) {
                    throw new Error('Generate gambar gagal.');
                }

                await new Promise(resolve => setTimeout(resolve, 5000));
                attempts++;
            } catch (err) {
                console.error('[waitForTask ERROR]', err.message);
                throw new Error('Gagal menunggu task selesai');
            }
        }
        throw new Error('Timeout menunggu hasil generate.');
    }

    app.get('/ai/img/ghibli', async (req, res) => {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ status: false, error: 'Parameter "url" diperlukan' });
        }

        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const ext = path.extname(url).replace('.', '').toLowerCase();
            const mime = `image/${ext}`;
            const hashx = `original/${Math.random().toString(36).slice(2)}_${Date.now()}.${ext}`;

            console.log('URL:', url);
            console.log('Image hashx:', hashx);

            const signedUrl = await getSignedUrl(hashx);
            if (!signedUrl) throw new Error('Gagal mendapatkan signed URL.');

            await uploadFile(signedUrl, response.data, mime);

            const imageUrl = `${imageBase}/${hashx}`;
            const taskId = await processImage(imageUrl);
            const resultUrl = await waitForTask(taskId);

            res.json({
                status: true,
                creator: 'Danz-dev',
                image: resultUrl
            });
        } catch (err) {
            console.error('[API ERROR]', err.message);
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
