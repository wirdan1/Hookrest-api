const express = require("express");
const path = require("path");
const app = express();

// serve static file (misalnya index.html di folder public)
app.use(express.static(path.join(__dirname, "public")));

// contoh endpoint API biasa
app.get("/api/test", (req, res) => {
  res.json({ message: "API jalan!" });
});

// endpoint untuk menampilkan halaman author
app.get("/owner", (req, res) => {
  res.sendFile(path.join(__dirname, "api-page", "author.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
