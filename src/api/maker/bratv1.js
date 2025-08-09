const { createCanvas, loadImage } = require('canvas');
const twemoji = require('twemoji');
const fetch = require('node-fetch');

module.exports = function(app) {
    async function generateBratImage(text) {
        try {
            const baseSize = Math.max(30, 30 - (text.length * 0.1)); // Ukuran dasar, mengecil seiring panjang teks
            const canvas = createCanvas(512, 512);
            const ctx = canvas.getContext('2d');

            // Background putih
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Pengaturan teks dengan font default minimal
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillStyle = '#000000';
            ctx.font = `${baseSize}px sans-serif`; // Gunakan font default paling dasar

            // Render teks dan emoji
            let y = 30;
            let x = 25;
            const lines = text.split('\n'); // Pisah baris jika ada
            for (let line of lines) {
                let currentX = x;
                for (const char of [...line]) {
                    if (twemoji.test(char)) {
                        const emojiUrl = twemoji.parse(char, {
                            folder: 'svg',
                            ext: '.svg'
                        }).match(/src="(.*?)"/)?.[1];

                        if (emojiUrl) {
                            const emojiPngUrl = emojiUrl.replace('/svg/', '/72x72/').replace('.svg', '.png');
                            const res = await fetch(emojiPngUrl);
                            const buf = await res.arrayBuffer();
                            const img = await loadImage(Buffer.from(buf));
                            ctx.drawImage(img, currentX, y, baseSize, baseSize);
                            currentX += baseSize + 5;
                            continue;
                        }
                    }
                    ctx.fillText(char, currentX, y);
                    currentX += ctx.measureText(char).width;
                }
                y += baseSize + 10;
                if (y + baseSize > canvas.height - 25) break; // Batasi tinggi
            }

            return canvas.toBuffer('image/png');
        } catch (error) {
            console.log('Error:', error);
            throw error;
        }
    }

    app.get('/maker/brat', async (req, res) => {
        try {
            const text = req.query.text;
            if (!text) {
                return res.status(400).send('Error: Text parameter is required');
            }

            const image = await generateBratImage(text);
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': image.length,
            });
            res.end(image);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};
