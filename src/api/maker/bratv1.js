const { createCanvas, loadImage } = require('canvas');
const twemoji = require('twemoji');
const fetch = require('node-fetch');

module.exports = function(app) {
    async function bratImage(text) {
        if (!text) throw new Error('Parameter "text" tidak boleh kosong');

        const canvas = createCanvas(512, 512);
        const ctx = canvas.getContext('2d');

        // Background putih
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Font setup
        let fontSize = 70; // lebih besar
        const maxWidth = canvas.width - 50; // margin kiri-kanan
        let lineHeight = 85; // jarak antar baris lebih jauh

        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#000000';

        // Fungsi wrap text
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

        // Sesuaikan font size biar muat
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
                const codePoint = twemoji.convert.toCodePoint(char);
                if (codePoint.length > 2 || parseInt(codePoint, 16) > 0x1F000) {
                    const emojiUrl = `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/${codePoint}.png`;
                    try {
                        const res = await fetch(emojiUrl);
                        const buf = await res.arrayBuffer();
                        const img = await loadImage(Buffer.from(buf));
                        ctx.drawImage(img, x, y, fontSize, fontSize);
                        x += fontSize;
                        continue;
                    } catch (err) {
                        // kalau gagal ambil emoji, fallback teks
                    }
                }
                ctx.fillText(char, x, y);
                x += ctx.measureText(char).width;
            }
            y += lineHeight;
        }

        return canvas.toBuffer('image/png');
    }

    // Endpoint mirip bluearchive
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
