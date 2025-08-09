const { createCanvas, loadImage } = require('canvas');
const twemoji = require('twemoji');
const fetch = require('node-fetch');

module.exports = function(app) {
    async function generateBratImage(text) {
        try {
            const baseFontSize = Math.max(70 - (text.length * 0.5), 20);
            const canvas = createCanvas(512, 512);
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            let fontSize = baseFontSize;
            const maxWidth = canvas.width - 50;
            let lineHeight = fontSize + 15;

            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillStyle = '#000000';
            ctx.font = `${fontSize}px`; // Tanpa font spesifik, pakai default sistem

            function wrapText(ctx, text, maxWidth) {
                const words = text.split(' ');
                const lines = [];
                let line = '';

                for (let i = 0; i < words.length; i++) {
                    const testLine = line + words[i] + ' ';
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > maxWidth && i > 0) {
                        lines.push(line.trim());
                        line = words[i] + ' ';
                    } else {
                        line = testLine;
                    }
                }
                lines.push(line.trim());
                return lines;
            }

            let lines;
            do {
                ctx.font = `${fontSize}px`;
                lines = wrapText(ctx, text, maxWidth);
                if (lines.length * lineHeight > canvas.height - 40) {
                    fontSize -= 2;
                    lineHeight -= 1;
                } else {
                    break;
                }
            } while (fontSize > 20);

            let y = 30;
            for (let line of lines) {
                let x = 25;
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
                            ctx.drawImage(img, x, y, fontSize, fontSize);
                            x += fontSize;
                            continue;
                        }
                    }
                    ctx.fillText(char, x, y);
                    x += ctx.measureText(char).width;
                }
                y += lineHeight;
            }

            return canvas.toBuffer('image/png');
        } catch (error) {
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
