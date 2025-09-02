const axios = require("axios");
const FormData = require("form-data");

module.exports = function (app) {
  const Keyy =
    "-mY6Nh3EWwV1JihHxpZEGV1hTxe2M_zDyT0i8WNeDV4buW9l02UteD6ZZrlAIO0qf6NhYA";

  // 🔹 START: upload gambar ke API, return jobId
  app.get("/api/enhance/start", async (req, res) => {
    try {
      const { imageUrl } = req.query;
      if (!imageUrl)
        return res
          .status(400)
          .json({ status: false, error: 'Parameter "imageUrl" diperlukan' });

      // pakai form-data tapi kirim URL bukan file
      const form = new FormData();
      form.append("url", imageUrl);

      const uploadRes = await axios.post(
        "https://reaimagine.zipoapps.com/enhance/autoenhance/",
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: Keyy,
            "User-Agent":
              "Dalvik/2.1.0 (Linux; U; Android 10; Redmi Note 5 Pro Build/QQ3A.200805.001)",
          },
          validateStatus: () => true,
        }
      );

      const name = uploadRes.headers["name"] || uploadRes.data?.name;
      if (!name)
        return res.status(500).json({
          status: false,
          creator: "Danz-dev",
          error: "Gagal ambil jobId dari upload response",
        });

      res.json({
        status: true,
        creator: "Danz-dev",
        result: { jobId: name },
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        creator: "Danz-dev",
        error: err.message,
      });
    }
  });

  // 🔹 RESULT: cek hasil enhancement pakai jobId
  app.get("/api/enhance/result", async (req, res) => {
    try {
      const { jobId } = req.query;
      if (!jobId)
        return res
          .status(400)
          .json({ status: false, error: 'Parameter "jobId" diperlukan' });

      const resultRes = await axios.post(
        "https://reaimagine.zipoapps.com/enhance/request_res/",
        null,
        {
          headers: {
            name: jobId,
            app: "enhanceit",
            ad: "0",
            Authorization: Keyy,
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent":
              "Dalvik/2.1.0 (Linux; U; Android 10; Redmi Note 5 Pro Build/QQ3A.200805.001)",
          },
          responseType: "arraybuffer",
          validateStatus: () => true,
        }
      );

      if (resultRes.status === 200 && resultRes.data && resultRes.data.length) {
        const base64Image = Buffer.from(resultRes.data).toString("base64");
        return res.json({
          status: true,
          creator: "Danz-dev",
          result: {
            jobId,
            image: `data:image/jpeg;base64,${base64Image}`,
          },
        });
      }

      res.json({
        status: true,
        creator: "Danz-dev",
        result: { jobId, ready: false },
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
