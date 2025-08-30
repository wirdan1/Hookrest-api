const express = require("express");
const path = require("path");
const app = express();

// serve semua file di folder api-page
app.use(express.static(path.join(__dirname, "api-page")));

// route khusus /owner
app.get("/owner", (req, res) => {
  res.sendFile(path.join(__dirname, "api-page", "author.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
