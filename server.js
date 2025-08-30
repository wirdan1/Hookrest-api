const express = require("express");
const path = require("path");
const app = express();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "api-page", "index.html"));
});

app.get("/owner", (req, res) => {
  res.sendFile(path.join(__dirname, "api-page", "author.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
