const { createCanvas, loadImage } = require('canvas');
const twemoji = require('twemoji');
const axios = require('axios');

module.exports = function(app) {
    async function bratImage(text) {
        try {
            if (!text) throw new Error('Parameter "text" tidak boleh kosong');

            const canvas = createCanvas(512, 512);
            const ctx = canvas.getContext('2d');

            // Background putih
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Font setup
            let fontSize = 70;
            const maxWidth = canvas.width - 50;
            let lineHeight = 85;

            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillStyle = '#000000';

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

            // Sesuaikan font size agar muat
            let lines;
            do {
                ctx.font = `bold ${fontSize}px Arial`;
                lines = wrapText(ctx, text, maxWidth);
                if (lines.length * lineHeight > canvas.height - 40) {
                    fontSize -= 2;
                    lineHeight -= 1;
                } else {
                    break;
                }
            } while (fontSize > 20);

            // Render text + emoji
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
                            const emojiPngUrl = emojiUrl
                                .replace('/svg/', '/72x72/')
                                .replace('.svg', '.png');
                            const res = await axios.get(emojiPngUrl, { responseType: 'arraybuffer' });
                            const img = await loadImage(Buffer.from(res.data));
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

    // Endpoint HTTP
    app.get('/maker/brat', async (req, res) => {
        try {
            const text = req.query.text;
            const imageBuffer = await bratImage(text);
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': imageBuffer.length
            });
            res.end(imageBuffer);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};
