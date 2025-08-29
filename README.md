
<h1 align="center">Hookrest API</h1>

<p align="center">
  <img src="https://qu.ax/oQSaT.jpg" alt="Hookrest Banner" width="65%">
</p>

<p align="center">
  <b>Simple & Modern REST API built by <a href="https://wa.me/62895323195263">Danz-dev</a></b><br><br>
  <img src="https://img.shields.io/badge/Status-Online-brightgreen?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Maintenance-Disabled-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Version-UI-orange?style=for-the-badge" />
</p>

---

## Overview
Hookrest adalah REST API modern yang menyediakan berbagai fitur siap pakai untuk developer.  
Fitur mencakup AI, Islami, Random Images, Search Tools, Downloader, hingga informasi harian.  

---

## Status Endpoint
Cek status API dengan endpoint berikut:

```http
GET /api/status

Example Code

app.get('/api/status', (req, res) => {
    res.json({
        status: true,
        creator: "Hookrest-Team",
        result: {
            status: "Aktif",
            totalrequest: "102",
            totalfitur: "25",
            runtime: "12m 30s",
            domain: "hookrest.my.id"
        }
    });
});

Example Response

{
  "status": true,
  "creator": "Hookrest-Team",
  "result": {
    "status": "Aktif",
    "totalrequest": "102",
    "totalfitur": "25",
    "runtime": "12m 30s",
    "domain": "hookrest.my.id"
  }
}


---

AI Example

Endpoint

/ai/chatgpt?question=Halo+apa+kabar

Response

{
  "status": true,
  "creator": "Danz-dev",
  "result": {
    "answer": "Halo! Saya baik, bagaimana denganmu?"
  }
}


---

Config (AI Only)

{
  "categories": [
    {
      "name": "AI (Artificial Intelligence)",
      "items": [
        {
          "name": "Chatgpt",
          "desc": "Talk with Chatgpt",
          "path": "/ai/chatgpt?question="
        }
      ]
    }
  ],
  "maintenance": {
    "enabled": false
  }
}


---

API Information

Key	false

Domain	hookrest.my.id
Creator	Danz-dev
Status	Online
Maintenance	Enable/Disable ( true/false )
Version	UI



---

Links

WhatsApp Channel

YouTube @danz-dev

Contact Me



---

<p align="center">
  <b>© 2025 Hookrest API — by Danz-dev</b>
</p>
```
