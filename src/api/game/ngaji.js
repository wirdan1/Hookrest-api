module.exports = function (app) {
  app.get("/api/ngaji", async (req, res) => {
    const sender = req.query.sender || "Anonymous"; // ambil nama user
    const now = Date.now();

    // Simulasi database user
    if (!global.db) global.db = { data: { users: {} } };
    if (!global.db.data.users[sender])
      global.db.data.users[sender] = { lastngaji: 0, money: 0, exp: 0, warn: 0 };

    let user = global.db.data.users[sender];
    let lastngaji = user.lastngaji || 0;
    let timers = 300000 - (now - lastngaji);

    if (timers > 0) {
      return res.json({
        status: false,
        message: `Sepertinya Kamu Sudah Kecapekan Silahkan Istirahat Dulu Selama ${clockString(
          timers
        )}`,
      });
    }

    // random hadiah
    let randomaku4 = Math.floor(Math.random() * 5);
    let randomaku5 = Math.floor(Math.random() * 10);

    let rbrb4 = randomaku4 * 15729;
    let rbrb5 = randomaku5 * 20000;

    let stages = [
      "Mencari Guru Ngaji.....",
      "Ketemu ustadz...",
      "Mulai mengaji",
      "Diajarin tajwid",
      "Ngasih tau, kalo qalqalah itu dipantulkan",
      `\n—[ Hasil Ngaji ${sender} ]—
➕💹 Uang jajan: ${rbrb4}
➕✨ Exp: ${rbrb5}
➕🤬 Dimarahin: -1`,
    ];

    // update stats
    user.warn -= 1;
    user.money += rbrb4;
    user.exp += rbrb5;
    user.lastngaji = now;

    return res.json({
      status: true,
      creator: "Danz-dev",
      result: {
        stages,
        reward: {
          money: rbrb4,
          exp: rbrb5,
          warn: -1,
        },
      },
    });
  });
};

// util untuk format waktu
function clockString(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
}
