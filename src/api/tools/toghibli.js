const axios = require('axios');
const FormData = require('form-data');

module.exports = function (app) {
  const ghibli = {
    api: {
      base: 'https://api.code12.cloud',
      endpoints: {
        paygate: (slug) => `/app/paygate-oauth${slug}`,
        ghibli: (slug) => `/app/v2/ghibli/user-image${slug}`,
      },
    },

    creds: {
      appId: 'DKTECH_GHIBLI_Dktechinc',
      secretKey: 'r0R5EKF4seRwqUIB8gLPdFvNmPm8rN63',
    },

    defaultStudio: 'ghibli-spirited-away-anime', // default studio paling populer

    headers: {
      'user-agent': 'NB Android/1.0.0',
      'accept-encoding': 'gzip',
    },

    db: './db.json',

    readDB: () => {
      try { return require('fs').existsSync(ghibli.db) ? JSON.parse(require('fs').readFileSync(ghibli.db, 'utf-8')) : null; } 
      catch { return null; }
    },

    writeDB: (data) => require('fs').writeFileSync(ghibli.db, JSON.stringify(data, null, 2), 'utf-8'),

    getNewToken: async () => {
      try {
        const url = `${ghibli.api.base}${ghibli.api.endpoints.paygate('/token')}`;
        const res = await axios.post(
          url,
          { appId: ghibli.creds.appId, secretKey: ghibli.creds.secretKey },
          { headers: { ...ghibli.headers, 'content-type': 'application/json' }, validateStatus: () => true }
        );

        if (res.status !== 200 || res.data?.status?.code !== '200') 
          return { success: false, code: res.status || 500, result: { error: res.data?.status?.message || 'Gagal ambil token' } };

        const { token, tokenExpire, encryptionKey } = res.data.data;
        ghibli.writeDB({ token, tokenExpire, encryptionKey });

        return { success: true, code: 200, result: { token, tokenExpire, encryptionKey } };
      } catch (err) {
        return { success: false, code: err?.response?.status || 500, result: { error: err.message } };
      }
    },

    getToken: async () => {
      const db = ghibli.readDB();
      const now = Date.now();
      if (db && db.token && db.tokenExpire && now < db.tokenExpire) return { success: true, code: 200, result: db };
      return await ghibli.getNewToken();
    },

    generate: async ({ imageUrl }) => {
      if (!imageUrl) return { success: false, code: 400, result: { error: 'imageUrl tidak boleh kosong' } };

      try {
        const tokenData = await ghibli.getToken();
        if (!tokenData.success) return tokenData;
        const { token } = tokenData.result;

        const form = new FormData();
        form.append('studio', ghibli.defaultStudio);
        form.append('url', imageUrl);

        const url = `${ghibli.api.base}${ghibli.api.endpoints.ghibli('/edit-theme')}?uuid=1212`;
        const res = await axios.post(url, form, { headers: { ...form.getHeaders(), ...ghibli.headers, authorization: `Bearer ${token}` }, validateStatus: () => true, maxContentLength: Infinity, maxBodyLength: Infinity });

        if (res.status !== 200 || res.data?.status?.code !== '200') 
          return { success: false, code: res.status || 500, result: { error: res.data?.status?.message || res.data?.message || `${res.status}` } };

        const { imageId, imageUrl: resultUrl, imageOriginalLink } = res.data.data;
        return { success: true, code: 200, result: { imageId, imageUrl: resultUrl, imageOriginalLink } };
      } catch (err) {
        return { success: false, code: err?.response?.status || 500, result: { error: err.message } };
      }
    },
  };

  // Endpoint Express
  app.get('/api/ghibli', async (req, res) => {
    const { imageUrl } = req.query;
    if (!imageUrl) return res.status(400).json({ status: false, error: 'Parameter "imageUrl" diperlukan' });

    try {
      const result = await ghibli.generate({ imageUrl });
      res.json({ status: true, creator: 'Danz-dev', result });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  });
};
