const axios = require('axios');

module.exports = function (app) {
    app.get('/ai/chatgpt', async (req, res) => {
        const { question, model = 'gpt-5', reasoning_effort = 'medium' } = req.query;

        const conf = {
            models: ['gpt-5', 'gpt-3.5'],
            reasoning: ['minimal', 'low', 'medium', 'high']
        };

        if (!question) {
            return res.status(400).json({
                status: false,
                error: 'Parameter "question" diperlukan.'
            });
        }

        if (!conf.models.includes(model)) {
            return res.status(400).json({
                status: false,
                error: `Available models: ${conf.models.join(', ')}`
            });
        }

        if (model === 'gpt-5' && !conf.reasoning.includes(reasoning_effort)) {
            return res.status(400).json({
                status: false,
                error: `Available reasoning effort: ${conf.reasoning.join(', ')}`
            });
        }

        try {
            const { data } = await axios.post('https://chatgpt-2022.vercel.app/api/chat', {
                conversationId: Date.now().toString(),
                messages: [{
                    role: 'user',
                    content: question
                }],
                ...(model === 'gpt-5' ? { reasoningEffort: reasoning_effort } : {}),
                model: model
            }, {
                headers: {
                    'content-type': 'application/json',
                    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
                }
            });

            const reasoning = data
                .split('\n\n')
                .filter(line => line)
                .map(line => JSON.parse(line.substring(6)))
                .filter(line => line.type === 'reasoning-done')?.[0]?.text || '';

            const text = data
                .split('\n\n')
                .filter(line => line)
                .map(line => JSON.parse(line.substring(6)))
                .filter(line => line.type === 'text-delta')
                .map(line => line.textDelta)
                .join('') || '';

            res.json({
                status: true,
                result: { reasoning, text }
            });

        } catch (err) {
            res.status(500).json({
                status: false,
                error: 'Gagal memproses permintaan ChatGPT2022.',
                message: err.message
            });
        }
    });
};
