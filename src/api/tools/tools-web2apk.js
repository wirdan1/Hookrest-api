const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

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

    async uploadFile(filePath, appId) {
      const data = new FormData();

      if (/^https?:\/\//i.test(filePath)) {
        const response = await axios.get(filePath, {
          responseType: "arraybuffer",
        });
        const filename = path.basename(filePath.split("?")[0]);
        data.append("file", Buffer.from(response.data), filename);
      } else {
        data.append("file", fs.createReadStream(filePath));
      }

      data.append("id", appId);

      const res = await axios.post(
        "https://standalone-app-api.appmaker.xyz/webapp/build/file-upload",
        data,
        { headers: { ...this.defaultHeaders, ...data.getHeaders() } }
      );
      return res.data;
    },

    async buildApp(appConfig) {
      const res = await axios.post(
        "https://standalone-app-api.appmaker.xyz/webapp/build/build",
        appConfig,
        { headers: this.defaultHeaders }
      );
      return res.data;
    },

    async checkStatus(appId) {
      const res = await axios.get(
        `https://standalone-app-api.appmaker.xyz/webapp/build/status?appId=${appId}`,
        {
          headers: {
            ...this.defaultHeaders,
            "if-none-match": 'W/"16f-VVclKRvUNSgEIOI1Ys1wn2XnTxM"',
          },
        }
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

    async create(url, email, appName, iconPath, splashPath, options = {}) {
      const createResult = await this.createApp(url, email);
      const appId = createResult.body.appId;

      const iconUpload = await this.uploadFile(iconPath, appId);
      const appIconUrl = iconUpload.cloudStoragePublicUrl;

      const splashUpload = await this.uploadFile(splashPath, appId);
      const splashIconUrl = splashUpload.cloudStoragePublicUrl;

      const appConfig = {
        appId: appId,
        appIcon: appIconUrl,
        appName: appName,
        isPaymentInProgress: false,
        enableShowToolBar: options.enableShowToolBar || true,
        toolbarColor: options.toolbarColor || "#03A9F4",
        toolbarTitleColor: options.toolbarTitleColor || "#FFFFFF",
        splashIcon: splashIconUrl,
        ...options,
      };

      await this.buildApp(appConfig);

      let status;
      let attempts = 0;
      const maxAttempts = 30;

      do {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        status = await this.checkStatus(appId);
        attempts++;

        if (status.body.status === "success") break;
        if (status.body.status === "failed") throw new Error("App build failed");
      } while (attempts < maxAttempts && status.body.status !== "success");

      if (attempts >= maxAttempts) {
        throw new Error("Build timeout - exceeded maximum wait time");
      }

      const downloadInfo = await this.getDownloadUrl(appId);

      return {
        appId: appId,
        appName: downloadInfo.body.appName,
        packageName: downloadInfo.body.package_name,
        downloadUrl: downloadInfo.body.buildFile,
        aabFile: downloadInfo.body.aabFile,
        keyFile: downloadInfo.body.keyFile,
        storePass: downloadInfo.body.storePass,
        keyPass: downloadInfo.body.keyPass,
        keySha: downloadInfo.body.keySha,
        sourceFile: downloadInfo.body.sourceFile,
        appIcon: downloadInfo.body.appIcon,
      };
    },
  };

  app.get("/tools/appmaker", async (req, res) => {
    const { url, email, appName, iconPath, splashPath } = req.query;

    if (!url || !email || !appName || !iconPath || !splashPath) {
      return res.status(400).json({
        status: false,
        creator: "Danz-dev",
        error: "Parameter url, email, appName, iconPath, splashPath wajib diisi",
      });
    }

    try {
      const result = await appmaker.create(
        url,
        email,
        appName,
        iconPath,
        splashPath
      );
      res.json({ status: true, creator: "Danz-dev", result });
    } catch (err) {
      res.status(500).json({
        status: false,
        creator: "Danz-dev",
        error: err.message,
      });
    }
  });
};
