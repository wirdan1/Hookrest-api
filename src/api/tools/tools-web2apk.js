const axios = require("axios");
const FormData = require("form-data");

module.exports = function (app) {
  const appmaker = {
    defaultHeaders: {
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36",
      Accept: "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "sec-ch-ua-platform": '"Android"',
      "sec-ch-ua":
        '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
      dnt: "1",
      "sec-ch-ua-mobile": "?1",
      origin: "https://create.appmaker.xyz",
      "sec-fetch-site": "same-site",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      referer: "https://create.appmaker.xyz/",
      "accept-language": "id,en-US;q=0.9,en;q=0.8,ja;q=0.7",
      priority: "u=1, i",
    },

    async createApp(url, email) {
      const res = await axios.post(
        "https://standalone-app-api.appmaker.xyz/webapp/build",
        { url, email },
        { headers: this.defaultHeaders }
      );
      return res.data;
    },

    async uploadFile(fileUrl, appId) {
      const fileRes = await axios.get(fileUrl, { responseType: "stream" });
      const form = new FormData();
      form.append("file", fileRes.data, { filename: "upload.png" });
      form.append("id", appId);

      const res = await axios.post(
        "https://standalone-app-api.appmaker.xyz/webapp/build/file-upload",
        form,
        { headers: { ...this.defaultHeaders, ...form.getHeaders() } }
      );
      return res.data.cloudStoragePublicUrl;
    },

    async buildApp(config) {
      const res = await axios.post(
        "https://standalone-app-api.appmaker.xyz/webapp/build/build",
        config,
        { headers: this.defaultHeaders }
      );
      return res.data;
    },

    async checkStatus(appId) {
      const res = await axios.get(
        `https://standalone-app-api.appmaker.xyz/webapp/build/status?appId=${appId}`,
        { headers: this.defaultHeaders }
      );
      return res.data;
    },

    async getDownloadUrl(appId) {
      const res = await axios.get(
        `https://standalone-app-api.appmaker.xyz/webapp/complete/download?appId=${appId}`,
        { headers: this.defaultHeaders }
      );
      return res.data;
    },

    async create(url, email, appName, iconUrl, splashUrl) {
      const createRes = await this.createApp(url, email);
      const appId = createRes.body.appId;

      const uploadedIcon = await this.uploadFile(iconUrl, appId);
      const uploadedSplash = splashUrl
        ? await this.uploadFile(splashUrl, appId)
        : uploadedIcon;

      const buildConfig = {
        appId,
        appIcon: uploadedIcon,
        appName,
        isPaymentInProgress: false,
        enableShowToolBar: true,
        toolbarColor: "#03A9F4",
        toolbarTitleColor: "#FFFFFF",
        splashIcon: uploadedSplash,
      };

      await this.buildApp(buildConfig);

      let status;
      let attempts = 0;
      const maxAttempts = 15; // maksimal 15 kali (30 detik)

      do {
        await new Promise((r) => setTimeout(r, 2000)); // tunggu 2 detik
        status = await this.checkStatus(appId);
        attempts++;
        if (status.body.status === "success") break;
        if (status.body.status === "failed") {
          throw new Error("Build failed");
        }
      } while (attempts < maxAttempts);

      const downloadInfo = await this.getDownloadUrl(appId);
      return downloadInfo.body.buildFile;
    },
  };

  app.get("/tools/appmaker", async (req, res) => {
    const { url, email, appName, iconUrl, splashUrl } = req.query;
    if (!url || !email || !appName || !iconUrl) {
      return res.status(400).json({
        status: false,
        error:
          "Parameter url, email, appName, iconUrl wajib diisi (splashUrl opsional)",
      });
    }

    try {
      const downloadUrl = await appmaker.create(
        url,
        email,
        appName,
        iconUrl,
        splashUrl
      );
      res.json({
        status: true,
        creator: "Danz-dev",
        downloadUrl,
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        creator: "Danz-dev",
        error: err.message,
      });
    }
  });
};
