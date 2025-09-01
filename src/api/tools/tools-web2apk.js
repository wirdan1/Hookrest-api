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

    createApp: async (url, email) => {
      const data = JSON.stringify({ url, email });
      const res = await axios.post(
        "https://standalone-app-api.appmaker.xyz/webapp/build",
        data,
        { headers: { ...appmaker.defaultHeaders, "Content-Type": "application/json" } }
      );
      return res.data;
    },

    uploadFile: async (fileUrl, appId) => {
      const form = new FormData();
      form.append("file", fileUrl);
      form.append("id", appId);
      const res = await axios.post(
        "https://standalone-app-api.appmaker.xyz/webapp/build/file-upload",
        form,
        { headers: { ...appmaker.defaultHeaders, ...form.getHeaders() } }
      );
      return res.data;
    },

    buildApp: async (config) => {
      const res = await axios.post(
        "https://standalone-app-api.appmaker.xyz/webapp/build/build",
        JSON.stringify(config),
        { headers: { ...appmaker.defaultHeaders, "Content-Type": "application/json" } }
      );
      return res.data;
    },

    checkStatus: async (appId) => {
      const res = await axios.get(
        `https://standalone-app-api.appmaker.xyz/webapp/build/status?appId=${appId}`,
        { headers: appmaker.defaultHeaders }
      );
      return res.data;
    },

    getDownloadUrl: async (appId) => {
      const res = await axios.get(
        `https://standalone-app-api.appmaker.xyz/webapp/complete/download?appId=${appId}`,
        { headers: appmaker.defaultHeaders }
      );
      return res.data;
    },
  };

  app.get("/tools/appmaker", async (req, res) => {
    const { url, email, appName, iconUrl, splashUrl } = req.query;
    if (!url || !email || !appName || !iconUrl || !splashUrl) {
      return res.status(400).json({
        status: false,
        creator: "Danz-dev",
        error: "Parameter url, email, appName, iconUrl, splashUrl wajib diisi",
      });
    }

    try {
      const createRes = await appmaker.createApp(url, email);
      const appId = createRes.body.appId;

      const iconUpload = await appmaker.uploadFile(iconUrl, appId);
      const splashUpload = await appmaker.uploadFile(splashUrl, appId);

      const buildConfig = {
        appId,
        appIcon: iconUpload.cloudStoragePublicUrl,
        appName,
        splashIcon: splashUpload.cloudStoragePublicUrl,
        enableShowToolBar: true,
        toolbarColor: "#03A9F4",
        toolbarTitleColor: "#FFFFFF",
      };

      await appmaker.buildApp(buildConfig);

      let status, attempts = 0;
      while (attempts < 30) {
        await new Promise((r) => setTimeout(r, 10000));
        status = await appmaker.checkStatus(appId);
        if (status.body.status === "success") break;
        if (status.body.status === "failed") throw new Error("App build failed");
        attempts++;
      }

      if (status.body.status !== "success") {
        throw new Error("Build timeout - exceeded maximum wait time");
      }

      const downloadInfo = await appmaker.getDownloadUrl(appId);

      res.json({
        status: true,
        creator: "Danz-dev",
        appId,
        appName: downloadInfo.body.appName,
        packageName: downloadInfo.body.package_name,
        downloadUrl: downloadInfo.body.buildFile,
        aabFile: downloadInfo.body.aabFile,
        icon: downloadInfo.body.appIcon,
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
