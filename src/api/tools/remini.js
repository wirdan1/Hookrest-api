const axios = require("axios");
const crypto = require("node:crypto");
const FormData = require("form-data");
const fake = require("fake-useragent");

module.exports = function (app) {
  const remini = {
    async process(url, settings = { ai_pipeline: "enhance" }) {
      const BASE_URL = "https://app.remini.ai";
      const URL_USER = "/api/v1/web/users";
      const URL_BULK = "/api/v1/web/tasks/bulk-upload";
      const URL_APPROVAL = "/api/v1/web/tasks/bulk-upload/BULK_UPLOAD_ID/process";
      const URL_TASK = "/api/v1/web/tasks/bulk-upload/";
      const BASE_URL_WM = "https://api.watermarkremover.io";
      const URL_REMOVE_WM = "/service/public/transformation/v1.0/predictions/wm/remove";
      const URL_SECRET = "https://api.pixelbin.io/service/public/transformation/v1.0/predictions/wm/remove";
      const SIGN_KEY = "A4nzUYcDOZ";

      const shaderTypes = ["FRAGMENT_SHADER", "VERTEX_SHADER"];
      const precisionLevels = ["LOW_FLOAT", "MEDIUM_FLOAT", "HIGH_FLOAT", "LOW_INT", "MEDIUM_INT", "HIGH_INT"];
      const extensions = [
        "ANGLE_instanced_arrays", "EXT_blend_minmax", "EXT_clip_control",
        "EXT_color_buffer_half_float", "EXT_depth_clamp", "EXT_disjoint_timer_query",
        "OES_texture_float", "OES_texture_half_float", "WEBGL_draw_buffers"
      ];
      const extensionParams = [
        "COLOR_ATTACHMENT0_WEBGL=36064", "COMPRESSED_RGBA_S3TC_DXT1_EXT=33777",
        "DEPTH_CLAMP_EXT=34383", "FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING_EXT=33296",
        "TEXTURE_MAX_ANISOTROPY_EXT=34046=16"
      ];

      const BULK_PAYLOAD = (settings) => ({
        input_task_list: [
          {
            image_content_type: "image/jpeg",
            output_content_type: "image/jpeg",
            ai_pipeline: settings.ai_pipeline
          }
        ]
      });

      let k = [2277735313, 289559509];
      let I = [1291169091, 658871167];
      let P = [0, 5];
      let C = [0, 1390208809];
      let A = [0, 944331445];
      let E = [4283543511, 3981806797];
      let S = [3301882366, 444984403];

      let headersListWm = {
        "authority": "api.watermarkremover.io",
        "accept": "application/json, text/plain, */*",
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7,ru;q=0.6",
        "origin": "https://www.watermarkremover.io",
        "pixb-cl-id": "d6b7221dce0eb93bfa9641d48b72bef6",
        "priority": "u=1, i",
        "referer": "https://www.watermarkremover.io/",
        "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent": fake()
      };

      let headersList = {
        "authority": "app.remini.ai",
        "accept": "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7,ru;q=0.6",
        "content-type": "application/json",
        "origin": "https://app.remini.ai",
        "priority": "u=1, i",
        "referer": "https://app.remini.ai/?v=9247d6bf-c36b-49ad-a3f0-a40e1297c3d2-1739612547618",
        "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": fake()
      };

      function _delay(msec) {
        return new Promise(resolve => setTimeout(resolve, msec));
      }

      async function req(url, method = "GET", data = null, headers = headersList) {
        try {
          const config = {
            method,
            url,
            headers,
            responseType: data instanceof FormData ? "arraybuffer" : "json"
          };
          if (data) config.data = data;
          const res = await axios(config);
          return res;
        } catch (error) {
          throw new Error(`Request failed: ${error.message}`);
        }
      }

      function randomChar(length = 5) {
        const chr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
        return Array.from({ length }).map(_ => chr.charAt(Math.floor(Math.random() * chr.length))).join("");
      }

      function generateRandomMathValues() {
        const x = Math.random() * 2 - 1;
        const y = Math.random() * 10;
        return {
          acos: Math.acos(Math.abs(x)),
          acosh: Math.acosh(y + 1),
          acoshPf: Math.acosh(y + 1),
          asin: Math.asin(x),
          asinh: Math.asinh(x),
          asinhPf: Math.asinh(x),
          atanh: Math.atanh(x * 0.9),
          atanhPf: Math.atanh(x * 0.9),
          atan: Math.atan(x),
          sin: Math.sin(y),
          sinh: Math.sinh(y),
          sinhPf: Math.sinh(y * 0.5),
          cos: Math.cos(y),
          cosh: Math.cosh(y),
          coshPf: Math.cosh(y),
          tan: Math.tan(y),
          tanh: Math.tanh(y),
          tanhPf: Math.tanh(y),
          exp: Math.exp(x),
          expm1: Math.expm1(x),
          expm1Pf: Math.expm1(x),
          log1p: Math.log1p(y),
          log1pPf: Math.log1p(y),
          powPI: Math.pow(Math.PI, -y)
        };
      }

      function getRandomParameter() {
        const keys = [
          "ACTIVE_ATTRIBUTES", "ACTIVE_TEXTURE", "ACTIVE_UNIFORMS", "ALIASED_LINE_WIDTH_RANGE",
          "ALIASED_POINT_SIZE_RANGE", "ALPHA", "ALPHA_BITS", "ALWAYS", "ARRAY_BUFFER",
          "ARRAY_BUFFER_BINDING", "ATTACHED_SHADERS", "BACK", "BLEND", "BLEND_COLOR",
          "BLEND_DST_ALPHA", "BLEND_DST_RGB", "BLEND_EQUATION", "BLEND_EQUATION_ALPHA",
          "BLEND_EQUATION_RGB", "BLEND_SRC_ALPHA", "BLEND_SRC_RGB", "BLUE_BITS",
          "BOOL", "BOOL_VEC2", "BOOL_VEC3", "BOOL_VEC4", "BROWSER_DEFAULT_WEBGL"
        ];
        const key = keys[Math.floor(Math.random() * keys.length)];
        const value = Math.random() > 0.5 ? Math.floor(Math.random() * 50000) : `${Math.floor(Math.random() * 1000)},${Math.floor(Math.random() * 1000)}`;
        return `${key}=${value}`;
      }

      function generateRandomParameters(count = 10) {
        const parameters = [];
        for (let i = 0; i < count; i++) {
          parameters.push(getRandomParameter());
        }
        return { parameters };
      }

      const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

      const generateShaderPrecisions = () => {
        return shaderTypes.flatMap(type =>
          precisionLevels.map(level => `${type}.${level}=${getRandomNumber(10, 200)},${getRandomNumber(10, 200)},${getRandomNumber(0, 50)}`)
        );
      };

      const generateExtensions = () => {
        return extensions.sort(() => Math.random() - 0.5).slice(0, getRandomNumber(5, extensions.length));
      };

      const generateExtensionParameters = () => {
        return extensionParams.sort(() => Math.random() - 0.5).slice(0, getRandomNumber(3, extensionParams.length));
      };

      const generateDummyData = () => {
        return {
          shaderPrecisions: generateShaderPrecisions(),
          extensions: generateExtensions(),
          extensionParameters: generateExtensionParameters()
        };
      };

      const COMPONENTS = {
        applePay: [-1, 1, 0][Math.floor(Math.random() * 2)],
        architecture: Math.floor(Math.random() * 255),
        audio: Math.random() * 999.9999,
        audioBaseLatency: [-1, -2, 1][Math.floor(Math.random() * 2)],
        canvas: {
          winding: [false, true][Math.floor(Math.random() * 2)],
          geometry: "data:image/png;base64,...", // Placeholder (original was truncated)
          text: "data:image/png;base64,..." // Placeholder (original was truncated)
        },
        colorDepth: Math.floor(Math.random() * 24),
        colorGamut: ["srgb", "rgb", "rgba"][Math.floor(Math.random() * 3)],
        contrast: Math.floor(Math.random() * 255),
        cookiesEnabled: true,
        deviceMemory: Math.floor(Math.random() * 24),
        fontPreferences: {
          default: Math.random() * 247.9999,
          apple: Math.random() * 239.1013,
          serif: Math.random() * 973.1287,
          sans: Math.random() * 778.1238,
          mono: Math.random() * 87.918351,
          min: Math.random() * 9.23409,
          system: Math.random() * 999.999999
        },
        fonts: [
          "Agency FB", "Calibri", "Century", "Century Gothic", "Franklin Gothic",
          "Futura Bk BT", "Futura Md BT", "Haettenschweiler", "Humanst521 BT",
          "Leelawadee", "Lucida Bright", "Lucida Sans", "MS Outlook",
          "MS Reference Specialty", "MS UI Gothic", "MT Extra", "Marlett",
          "Microsoft Uighur", "Monotype Corsiva", "Pristina", "Segoe UI Light"
        ].slice(Math.random() * 5, Math.random() * 20),
        forcedColors: false,
        hardwareConcurrency: Math.floor(Math.random() * 12),
        hdr: [false, true, false][Math.floor(Math.random() * 2)],
        indexedDB: true,
        languages: [
          ["id-ID", "en-EN", "us-US", "eu-EU"][Math.floor(Math.random() * 3)]
        ],
        localStorage: true,
        math: generateRandomMathValues(),
        monochrome: 0,
        openDatabase: false,
        pdfViewerEnabled: true,
        platform: ["Win32", "Win64", "Linux", "MacOS"][Math.floor(Math.random() * 4)],
        plugins: [
          {
            name: "PDF Viewer",
            description: "Portable Document Format",
            mimeTypes: [
              { type: "application/pdf", suffixes: "pdf" },
              { type: "text/pdf", suffixes: "pdf" }
            ]
          },
          {
            name: "Chrome PDF Viewer",
            description: "Portable Document Format",
            mimeTypes: [
              { type: "application/pdf", suffixes: "pdf" },
              { type: "text/pdf", suffixes: "pdf" }
            ]
          },
          {
            name: "Chromium PDF Viewer",
            description: "Portable Document Format",
            mimeTypes: [
              { type: "application/pdf", suffixes: "pdf" },
              { type: "text/pdf", suffixes: "pdf" }
            ]
          },
          {
            name: "Microsoft Edge PDF Viewer",
            description: "Portable Document Format",
            mimeTypes: [
              { type: "application/pdf", suffixes: "pdf" },
              { type: "text/pdf", suffixes: "pdf" }
            ]
          },
          {
            name: "WebKit built-in PDF",
            description: "Portable Document Format",
            mimeTypes: [
              { type: "application/pdf", suffixes: "pdf" },
              { type: "text/pdf", suffixes: "pdf" }
            ]
          }
        ].slice(0, Math.floor(Math.random() * 5)),
        reducedMotion: false,
        reducedTransparency: false,
        screenFrame: [0, 0, 50, 0],
        screenResolution: [Math.random() * 4090, Math.random() * 3090],
        sessionStorage: true,
        timezone: "Asia/Jakarta",
        touchSupport: {
          maxTouchPoints: 0,
          touchEvent: false,
          touchStart: false
        },
        vendor: randomChar(10),
        vendorFlavors: ["chrome"],
        webGlBasics: {
          version: "WebGL 1.0 (OpenGL ES 2.0 Chromium)",
          vendor: "WebKit",
          vendorUnmasked: `${randomChar(10)} (NVIDIA)`,
          renderer: "WebKit WebGL",
          rendererUnmasked: `ANGLE (NVIDIA, NVIDIA GeForce RTX ${["3090", "4090", "5090", "360", "450", "720"][Math.floor(Math.random() * 6)]} (0x00001380) Direct3D11 vs_5_0 ps_5_0, D3D11)`,
          shadingLanguageVersion: "WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)"
        },
        webGlExtensions: {
          contextAttributes: [
            `alpha=${Math.random() < 0.5}`,
            `antialias=${Math.random() < 0.5}`,
            `depth=${Math.random() < 0.5}`,
            `desynchronized=${Math.random() < 0.5}`,
            `failIfMajorPerformanceCaveat=${Math.random() < 0.5}`,
            `powerPreference=default`,
            `premultipliedAlpha=${Math.random() < 0.5}`,
            `preserveDrawingBuffer=${Math.random() < 0.5}`,
            `stencil=${Math.random() < 0.5}`,
            `xrCompatible=${Math.random() < 0.5}`
          ],
          parameters: generateRandomParameters(15),
          ...generateDummyData(),
          unsupportedExtensions: []
        }
      };

      function _(e, t) {
        if ((t %= 64) !== 0) {
          if (t < 32) {
            e[0] = e[1] >>> 32 - t;
            e[1] = e[1] << t;
          } else {
            e[0] = e[1] << t - 32;
            e[1] = 0;
          }
        }
      }

      function b(e, t) {
        let n = e[0] >>> 16;
        let r = e[0] & 65535;
        let o = e[1] >>> 16;
        let i = e[1] & 65535;
        let a = t[0] >>> 16;
        let s = t[0] & 65535;
        let l = t[1] >>> 16;
        let u = t[1] & 65535;
        let c = 0;
        let d = 0;
        let f = 0;
        let p = 0;
        f += (p += i * u) >>> 16;
        p &= 65535;
        d += (f += o * u) >>> 16;
        f &= 65535;
        d += (f += i * l) >>> 16;
        f &= 65535;
        c += (d += r * u) >>> 16;
        d &= 65535;
        c += (d += o * l) >>> 16;
        d &= 65535;
        c += (d += i * s) >>> 16;
        d &= 65535;
        c += n * u + r * l + o * s + i * a;
        c &= 65535;
        e[0] = c << 16 | d;
        e[1] = f << 16 | p;
      }

      function w(e, t) {
        let n = e[0];
        if ((t %= 64) === 32) {
          e[0] = e[1];
          e[1] = n;
        } else if (t < 32) {
          e[0] = n << t | e[1] >>> 32 - t;
          e[1] = e[1] << t | n >>> 32 - t;
        } else {
          t -= 32;
          e[0] = e[1] << t | n >>> 32 - t;
          e[1] = n << t | e[1] >>> 32 - t;
        }
      }

      function x(e, t) {
        e[0] ^= t[0];
        e[1] ^= t[1];
      }

      function y(e, t) {
        let n = e[0] >>> 16;
        let r = e[0] & 65535;
        let o = e[1] >>> 16;
        let i = e[1] & 65535;
        let a = t[0] >>> 16;
        let s = t[0] & 65535;
        let l = t[1] >>> 16;
        let u = 0;
        let c = 0;
        let d = 0;
        let f = 0;
        d += (f += i + (t[1] & 65535)) >>> 16;
        f &= 65535;
        c += (d += o + l) >>> 16;
        d &= 65535;
        u += (c += r + s) >>> 16;
        c &= 65535;
        u += n + a;
        u &= 65535;
        e[0] = u << 16 | c;
        e[1] = d << 16 | f;
      }

      function O(e) {
        let t = [0, e[0] >>> 1];
        x(e, t);
        b(e, E);
        t[1] = e[0] >>> 1;
        x(e, t);
        b(e, S);
        t[1] = e[0] >>> 1;
        x(e, t);
      }

      function _encrypt(e) {
        let n = new Uint8Array(new TextEncoder().encode(e));
        let t = 0;
        let r;
        let o = [0, n.length];
        let i = o[1] % 16;
        let a = o[1] - i;
        let s = [0, t];
        let l = [0, t];
        let u = [0, 0];
        let c = [0, 0];
        for (r = 0; r < a; r += 16) {
          u[0] = n[r + 4] | n[r + 5] << 8 | n[r + 6] << 16 | n[r + 7] << 24;
          u[1] = n[r] | n[r + 1] << 8 | n[r + 2] << 16 | n[r + 3] << 24;
          c[0] = n[r + 12] | n[r + 13] << 8 | n[r + 14] << 16 | n[r + 15] << 24;
          c[1] = n[r + 8] | n[r + 9] << 8 | n[r + 10] << 16 | n[r + 11] << 24;
          b(u, k);
          w(u, 31);
          b(u, I);
          x(s, u);
          w(s, 27);
          y(s, l);
          b(s, P);
          y(s, C);
          b(c, I);
          w(c, 33);
          b(c, k);
          x(l, c);
          w(l, 31);
          y(l, s);
          b(l, P);
          y(l, A);
        }
        u[0] = 0;
        u[1] = 0;
        c[0] = 0;
        c[1] = 0;
        let d = [0, 0];
        switch (i) {
          case 15:
            d[1] = n[r + 14];
            _(d, 48);
            x(c, d);
          case 14:
            d[1] = n[r + 13];
            _(d, 40);
            x(c, d);
          case 13:
            d[1] = n[r + 12];
            _(d, 32);
            x(c, d);
          case 12:
            d[1] = n[r + 11];
            _(d, 24);
            x(c, d);
          case 11:
            d[1] = n[r + 10];
            _(d, 16);
            x(c, d);
          case 10:
            d[1] = n[r + 9];
            _(d, 8);
            x(c, d);
          case 9:
            d[1] = n[r + 8];
            x(c, d);
            b(c, I);
            w(c, 33);
            b(c, k);
            x(l, c);
          case 8:
            d[1] = n[r + 7];
            _(d, 56);
            x(u, d);
          case 7:
            d[1] = n[r + 6];
            _(d, 48);
            x(u, d);
          case 6:
            d[1] = n[r + 5];
            _(d, 40);
            x(u, d);
          case 5:
            d[1] = n[r + 4];
            _(d, 32);
            x(u, d);
          case 4:
            d[1] = n[r + 3];
            _(d, 24);
            x(u, d);
          case 3:
            d[1] = n[r + 2];
            _(d, 16);
            x(u, d);
          case 2:
            d[1] = n[r + 1];
            _(d, 8);
            x(u, d);
          case 1:
            d[1] = n[r];
            x(u, d);
            b(u, k);
            w(u, 31);
            b(u, I);
            x(s, u);
        }
        x(s, o);
        x(l, o);
        y(s, l);
        y(l, s);
        O(s);
        O(l);
        y(s, l);
        y(l, s);
        return ("00000000" + (s[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (s[1] >>> 0).toString(16)).slice(-8) + ("00000000" + (l[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (l[1] >>> 0).toString(16)).slice(-8);
      }

      function _objToStr(e) {
        let t = "";
        for (let n = 0, r = Object.keys(e).sort(); n < r.length; n++) {
          const o = r[n];
          const i = e[o];
          const a = typeof i === "string" ? i : JSON.stringify(i);
          t += `${t ? "|" : ""}${o.replace(/([:|\\])/g, "\\$1")}:${a}`;
        }
        return t;
      }

      function _visitorId() {
        const txt = _objToStr(COMPONENTS);
        const enc = _encrypt(txt.trim());
        return enc;
      }

      async function _initSignature() {
        const iso = new Date().toISOString();
        const params = Buffer.from(iso).toString("base64");
        const uri = new URL(URL_SECRET);
        const vis = _visitorId();
        const hm = `POST${encodeURI(uri.pathname + uri.search)}${iso}${vis}`;
        const sig = crypto.createHmac("sha256", SIGN_KEY).update(hm).digest("hex");
        headersListWm["x-ebg-param"] = params;
        headersListWm["x-ebg-signature"] = sig;
        headersListWm["pixb-cl-id"] = vis;
      }

      async function _init() {
        try {
          const res = await req(BASE_URL + URL_USER, "POST");
          headersList["Authorization"] = `Bearer ${res.data.access_token}`;
          return true;
        } catch (error) {
          throw new Error(`Initialization failed: ${error.message}`);
        }
      }

      async function _upload(settings) {
        try {
          const res = await req(BASE_URL + URL_BULK, "POST", BULK_PAYLOAD(settings));
          return res.data;
        } catch (error) {
          throw new Error(`Upload failed: ${error.message}`);
        }
      }

      async function _approval(data, settings) {
        try {
          const res = await req(BASE_URL + URL_APPROVAL.replace("BULK_UPLOAD_ID", data.bulk_upload_id), "POST", BULK_PAYLOAD(settings));
          return res.status;
        } catch (error) {
          throw new Error(`Approval failed: ${error.message}`);
        }
      }

      async function _approvalWm() {
        try {
          const res = await req(BASE_URL_WM + URL_REMOVE_WM, "OPTIONS", null, headersListWm);
          return res.status;
        } catch (error) {
          throw new Error(`Watermark approval failed: ${error.message}`);
        }
      }

      async function _send(data, buffer) {
        try {
          headersList["content-type"] = "image/jpeg";
          headersList["x-goog-custom-time"] = data.task_list[0].upload_headers["x-goog-custom-time"];
          const res = await req(data.task_list[0].upload_url, "PUT", buffer);
          return res.status;
        } catch (error) {
          throw new Error(`Image send failed: ${error.message}`);
        }
      }

      async function _task(data) {
        try {
          headersList["content-type"] = "application/json";
          const res = await req(BASE_URL + URL_TASK + data.bulk_upload_id);
          return res.data;
        } catch (error) {
          throw new Error(`Task status check failed: ${error.message}`);
        }
      }

      async function removeWatermark(imageUrl) {
        try {
          const res = await axios.get(imageUrl, { responseType: "arraybuffer" });
          const buffer = Buffer.from(res.data, "binary");

          const status = await _approvalWm();
          if (status !== 204) {
            throw new Error("Watermark removal request denied");
          }

          await _initSignature();
          const form = new FormData();
          form.append("input.image", buffer, { filename: `${crypto.randomUUID()}.jpg`, contentType: "image/jpeg" });
          form.append("input.rem_text", "false");
          form.append("input.rem_logo", "false");
          form.append("retention", "1d");

          const headers = { ...headersListWm, ...form.getHeaders() };
          const resWm = await req(BASE_URL_WM + URL_REMOVE_WM, "POST", form.getBuffer(), headers);
          const jsn = resWm.data;

          if (jsn.status !== "ACCEPTED") {
            throw new Error("Watermark removal request not accepted");
          }

          const uri = new URL(jsn.urls.get);
          const headOri = {
            origin: "https://" + uri.hostname,
            referer: jsn.urls.get,
            "user-agent": fake()
          };

          while (true) {
            const rm = await req(jsn.urls.get, "GET", null, headOri);
            if (rm.data.status === "SUCCESS") {
              return rm.data;
            }
            await _delay(5000);
          }
        } catch (error) {
          throw new Error(`Watermark removal failed: ${error.message}`);
        }
      }

      try {
        // Validate URL
        if (!/https?:\/\/[^\s/$.?#].[^\s]*/i.test(url)) {
          throw new Error("Parameter 'url' must be a valid URL");
        }

        const res = await axios.get(url, { responseType: "arraybuffer" });
        const buffer = Buffer.from(res.data, "binary");

        await _init();
        const data = await _upload(settings);
        const sendStatus = await _send(data, buffer);
        if (sendStatus !== 200) {
          throw new Error("Failed to send image");
        }

        const approvalStatus = await _approval(data, settings);
        if (approvalStatus !== 202) {
          throw new Error("Request not accepted");
        }

        let wm;
        while (true) {
          const taskData = await _task(data);
          if (taskData.task_list[0].status === "completed") {
            wm = taskData;
            break;
          }
          await _delay(2000);
        }

        let no_wm;
        if (wm.task_list[0].result.outputs[0].has_watermark) {
          const rm = await removeWatermark(wm.task_list[0].result.outputs[0].url);
          no_wm = rm ? rm.output[0] : wm.task_list[0].result.outputs[0].url;
        } else {
          no_wm = wm.task_list[0].result.outputs[0].url;
        }

        const finalImage = await axios.get(no_wm, { responseType: "arraybuffer" });
        return Buffer.from(finalImage.data, "binary");
      } catch (err) {
        throw new Error(`Failed to process image: ${err.message}`);
      }
    }
  };

  // Endpoint API Remini (menggunakan parameter url)
  app.get("/tools/remini", async (req, res) => {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        status: false,
        error: 'Parameter "url" wajib diisi'
      });
    }

    if (!/https?:\/\/[^\s/$.?#].[^\s]*/i.test(url)) {
      return res.status(400).json({
        status: false,
        error: 'Parameter "url" harus berupa URL yang valid'
      });
    }

    try {
      const buffer = await remini.process(url);
      res.set("Content-Type", "image/png");
      res.send(buffer);
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  });
};
