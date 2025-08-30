const axios = require('axios');

module.exports = function (app) {
    const kimi = {
        _generateId() {
            return String(Date.now()) + Math.floor(Math.random() * 1000);
        },

        _createHeaders(deviceId, sessionId) {
            return {
                'content-type': 'application/json',
                'x-language': 'zh-CN',
                'x-msh-device-id': deviceId,
                'x-msh-platform': 'web',
                'x-msh-session-id': sessionId,
                'x-traffic-id': deviceId
            };
        },

        async getToken() {
            try {
                const deviceId = this._generateId();
                const sessionId = this._generateId();
                const headers = this._createHeaders(deviceId, sessionId);

                const response = await axios.post('https://www.kimi.com/api/device/register', {}, {
                    headers,
                    timeout: 10000
                });

                return {
                    auth: `Bearer ${response.data.access_token}`,
                    cookie: response.headers['set-cookie'].join('; '),
                    headers
                };
            } catch (err) {
                throw new Error('Gagal ambil token: ' + (err.response?.data?.message || err.message));
            }
        },

        async chat(question, options = {}) {
            if (!question || typeof question !== 'string') {
                throw new Error('Pertanyaan wajib berupa string');
            }

            const { model = 'k2', search = true, deep_research = false } = options;
            const { auth, cookie, headers } = await this.getToken();

            // Buat session chat
            const chatSession = await axios.post('https://www.kimi.com/api/chat', {
                name: 'Session',
                born_from: 'home',
                kimiplus_id: 'kimi',
                is_example: false,
                source: 'web',
                tags: []
            }, {
                headers: {
                    authorization: auth,
                    cookie,
                    ...headers
                },
                timeout: 10000
            });

            const chatId = chatSession.data.id;

            // Kirim pertanyaan
            const completion = await axios.post(
                `https://www.kimi.com/api/chat/${chatId}/completion/stream`,
                {
                    kimiplus_id: 'kimi',
                    extend: { sidebar: true },
                    model,
                    use_search: search,
                    messages: [{ role: 'user', content: question }],
                    refs: [],
                    history: [],
                    scene_labels: [],
                    use_semantic_memory: false,
                    use_deep_research: deep_research
                },
                {
                    headers: {
                        authorization: auth,
                        cookie,
                        ...headers
                    },
                    timeout: 30000
                }
            );

            // Parse hasil streaming
            const result = { text: '', sources: [], citations: [] };
            const lines = completion.data.split('\n\n');

            for (const line of lines) {
                if (line.startsWith('data:')) {
                    try {
                        const data = JSON.parse(line.substring(6));
                        if (data.event === 'cmpl' && data.text) result.text += data.text;
                        if (data.event === 'search_citation' && data.values) {
                            result.citations = Object.values(data.values);
                        }
                    } catch { }
                }
            }

            return result;
        }
    };

    // Endpoint API utama
    app.get('/ai/kimi', async (req, res) => {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ status: false, error: 'Parameter "q" wajib diisi' });
        }

        try {
            const result = await kimi.chat(q);
            res.json({ status: true, creator: 'Danz-dev', result });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
