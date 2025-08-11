const axios = require('axios');

module.exports = function (app) {
  // Endpoint: /douyinsearch?keyword=indonesia
  app.get('/douyin/search', async (req, res) => {
    const keyword = req.query.keyword;
    if (!keyword) {
      return res.status(400).json({
        status: false,
        message: 'Parameter ?keyword= harus diisi'
      });
    }

    try {
      const url = `https://www.douyin.com/aweme/v1/web/general/search/single/?device_platform=webapp&aid=6383&channel=channel_pc_web&search_channel=aweme_general&enable_history=1&keyword=${encodeURIComponent(keyword)}&search_source=normal_search&query_correct_type=1&is_filter_search=0&offset=10&count=10&need_filter_settings=0&list_type=&update_version_code=170400&pc_client_type=1&support_h265=1&support_dash=1`;

      const headers = {
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
        "referer": `https://www.douyin.com/root/search/${encodeURIComponent(keyword)}`,
        // Ganti cookie sesuai session yang valid
        "cookie": "__ac_nonce=068984a6900a2b950ffa0; __ac_signature=_02B4Z6wo00f01X5KMRAAAIDD9sh4uxxdKJF-ajWAADcO38;"
      };

      const { data } = await axios.get(url, { headers });

      res.json({
        status: true,
        keyword,
        results: data
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: 'Gagal mengambil data dari Douyin',
        error: error.message
      });
    }
  });
};
