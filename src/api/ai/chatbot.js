const axios = require("axios");

module.exports = function (app) {
  const API_URL =
    "https://mpzxsmlptc4kfw5qw2h6nat6iu0hvxiw.lambda-url.us-east-2.on.aws/process";
  const API_KEY =
    "Bearer sk-proj-6WaGz0cNPN5ILBClacpFhlW-7UOnknRtuEoPoV0rgMM7y50hvnZsMjrApOFN8r9vnIa-IOwTwvT3BlbkFJA93BY4mqTbjUGMQC_rkb5YJNcIsYnfjvFMxjVKU0bsEDNCciyzCCI4GuhNAwp";

  async function ai(question) {
    let data = {
      messages: [
        {
          content: "Hello, how can i assist you today?",
          role: "system",
        },
        {
          content: question,
          role: "user",
        },
      ],
      model: "gpt-3.5-turbo-0125",
      temperature: 0.9,
    };

    let config = {
      method: "POST",
      url: API_URL,
      headers: {
        "User-Agent": "okhttp/3.14.9",
        Connection: "Keep-Alive",
        "Accept-Encoding": "gzip",
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: API_KEY,
      },
      data: JSON.stringify(data),
    };

    const api = await axios.request(config);
    return api.data;
  }

  // endpoint API
  app.get("/api/ai", async (req, res) => {
    const { question } = req.query;

    if (!question) {
      return res
        .status(400)
        .json({ status: false, error: 'Parameter "question" diperlukan' });
    }

    try {
      const result = await ai(question);
      res.json({
        status: true,
        creator: "Danz-dev",
        result,
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        error: err.message,
      });
    }
  });
};
