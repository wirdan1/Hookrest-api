const sharp = require('sharp');
const twemoji = require('twemoji');
const fetch = require('node-fetch');

module.exports = function(app) {
    async function generateBratImage(text) {
        try {
            const svg = `
                <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100%" height="100%" fill="white"/>
                    <text x="25" y="50" font-size="${Math.max(70 - (text.length * 0.5), 20)}" fill="black" font-family="sans-serif">${text}</text>
                </svg>
            `;
            const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
            return buffer;
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
