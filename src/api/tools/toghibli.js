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

    defaultStudio: 'ghibli-spirited-away-anime',

    headers: {
      'user-agent': 'NB Android/1.0.0',
      'accept-encoding': 'gzip',
    },

    cache: {
      token: null,
      tokenExpire: 0,
      encryptionKey: null,
    },

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
        ghibli.cache = { token, tokenExpire, encryptionKey };

        return { success: true, code: 200, result: { token, tokenExpire, encryptionKey } };
      } catch (err) {
        return { success: false, code: err?.response?.status || 500, result: { error: err.message } };
      }
    },

    getToken: async () => {
      const now = Date.now();
      if (ghibli.cache.token && ghibli.cache.tokenExpire && now < ghibli.cache.tokenExpire) {
        return { success: true, code: 200, result: ghibli.cache };
      }
      return await ghibli.getNewToken();
    },

    generate: async ({ imageUrl }) => {
      if (!imageUrl) return { success: false, code: 400, result: { error: 'imageUrl tidak boleh kosong' } };

      try {
        const tokenData = await ghibli.getToken();
        if (!tokenData.success) return tokenData;
        const { token, encryptionKey } = tokenData.result;

        // download image ke buffer
        const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(imgRes.data, 'binary');

        const form = new FormData();
        form.append('studio', ghibli.defaultStudio);
        form.append('file', buffer, {
          filename: 'image.jpg',
          contentType: 'image/jpeg',
        });
        // tambahkan encryptionKey & uuid
        form.append('encryptionKey', encryptionKey);
        form.append('uuid', '1212');

        const url = `${ghibli.api.base}${ghibli.api.endpoints.ghibli('/edit-theme')}`;
        const res = await axios.post(url, form, {
          headers: { ...form.getHeaders(), ...ghibli.headers, authorization: `Bearer ${token}` },
          validateStatus: () => true,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });

        if (res.status !== 200 || res.data?.status?.code !== '200')
          return {
            success: false,
            code: res.status || 500,
            result: { error: res.data?.status?.message || res.data?.message || `${res.status}` },
          };

        const { imageId, imageUrl: resultUrl, imageOriginalLink } = res.data.data;
        return { success: true, code: 200, result: { imageId, imageUrl: resultUrl, imageOriginalLink } };
      } catch (err) {
        return { success: false, code: err?.response?.status || 500, result: { error: err.message } };
      }
    },
  };

  // endpoint
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
