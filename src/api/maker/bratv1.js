const { createCanvas, loadImage } = require('canvas');
const twemoji = require('twemoji');
const fetch = require('node-fetch');

module.exports = function (app) {
  // Endpoint: /brat?text=Halo%20ganteng%20😎
  app.get('/maker/brat', async (req, res) => {
    const text = req.query.text;
    if (!text) {
      return res.status(400).json({
        status: false,
        message: 'Parameter ?text= harus diisi'
      });
    }

    try {
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

      // Sesuaikan font size
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
              const emojiPngUrl = emojiUrl.replace('/svg/', '/72x72/').replace('.svg', '.png');
              const resEmoji = await fetch(emojiPngUrl);
              const buf = await resEmoji.arrayBuffer();
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

      // Output PNG langsung
      res.setHeader('Content-Type', 'image/png');
      res.send(canvas.toBuffer('image/png'));

    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: 'Terjadi kesalahan saat membuat gambar',
        error: error.message
      });
    }
  });
};
