document.addEventListener("DOMContentLoaded", async () => {
  const loadingScreen = document.getElementById("loadingScreen");
  const body = document.body;
  body.classList.add("no-scroll");

  document.body.classList.add("dark-mode");

  try {
    const settings = await fetch("/src/settings.json").then((res) => res.json());

    const setContent = (id, property, value) => {
      const element = document.getElementById(id);
      if (element) element[property] = value;
    };

    document.getElementById("currentYear").textContent = new Date().getFullYear();

    setContent("page", "textContent", settings.name || "Hookrest API");
    setContent("header", "textContent", settings.name || "Hookrest API");
    setContent("footerBrand", "textContent", settings.name || "Hookrest API");
    setContent("name", "textContent", settings.name || "Hookrest API");
    setContent("copyrightName", "textContent", settings.name || "Hookrest API");
    setContent("description", "textContent", settings.description || "Simple API's");

    const apiContent = document.getElementById("apiContent");
    settings.categories.forEach((category) => {
      const categoryDiv = document.createElement("div");
      categoryDiv.className = "api-category";
      const categoryHeader = document.createElement("div");
      categoryHeader.className = "api-category-header";
      categoryHeader.innerHTML = `<span>${category.name}</span><i class="fas fa-chevron-down"></i>`;
      categoryDiv.appendChild(categoryHeader);
      const categoryBody = document.createElement("div");
      categoryBody.className = "api-category-content";
      categoryBody.style.display = "none";
      const sortedItems = category.items.sort((a, b) => a.name.localeCompare(b.name));
      sortedItems.forEach((item) => {
        const endpointCard = document.createElement("div");
        endpointCard.className = "api-endpoint-card";
        endpointCard.dataset.apiPath = item.path;
        endpointCard.dataset.apiName = item.name;
        endpointCard.dataset.apiDesc = item.desc;
        endpointCard.dataset.apiInnerDesc = item.innerDesc || "";
        endpointCard.innerHTML = `<span class="method-badge">GET</span><div class="endpoint-text"><span class="endpoint-path">${item.path.split('?')[0]}</span><span class="endpoint-name">${item.name}</span></div><i class="fas fa-lock lock-icon"></i><i class="fas fa-chevron-down"></i>`;
        categoryBody.appendChild(endpointCard);
      });
      categoryDiv.appendChild(categoryBody);
      apiContent.appendChild(categoryDiv);
      categoryHeader.addEventListener("click", () => {
        categoryBody.style.display = categoryBody.style.display === "none" ? "grid" : "none";
        categoryHeader.classList.toggle("collapsed");
        categoryHeader.querySelector(".fas").classList.toggle("fa-chevron-up");
        categoryHeader.querySelector(".fas").classList.toggle("fa-chevron-down");
      });
    });

    // --- PERUBAHAN DI SINI: Panggil fungsi untuk cek status endpoint ---
    checkEndpointsStatus(settings);

    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();
      document.querySelectorAll(".api-endpoint-card").forEach((item) => {
        const name = item.dataset.apiName.toLowerCase();
        const path = item.dataset.apiPath.toLowerCase();
        item.style.display = name.includes(searchTerm) || path.includes(searchTerm) ? "flex" : "none";
      });
      document.querySelectorAll(".api-category").forEach((categoryDiv) => {
        const categoryBody = categoryDiv.querySelector(".api-category-content");
        const visibleItems = categoryBody.querySelectorAll('.api-endpoint-card[style*="display: flex"]');
        if (visibleItems.length > 0) {
          categoryDiv.style.display = "";
          categoryBody.style.display = "grid";
          categoryDiv.querySelector(".api-category-header").classList.remove("collapsed");
          categoryDiv.querySelector(".api-category-header .fas").classList.replace("fa-chevron-down", "fa-chevron-up");
        } else {
          categoryDiv.style.display = "none";
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".api-endpoint-card")) return;
      const card = event.target.closest(".api-endpoint-card");
      const { apiPath, apiName, apiDesc, apiInnerDesc } = card.dataset;
      const modal = new bootstrap.Modal(document.getElementById("apiResponseModal"));
      const modalRefs = {
        label: document.getElementById("apiResponseModalLabel"),
        desc: document.getElementById("apiResponseModalDesc"),
        modalApiDescription: document.getElementById("modalApiDescription"),
        modalEndpointPath: document.getElementById("modalEndpointPath"),
        queryInputContainer: document.getElementById("apiQueryInputContainer"),
        submitBtn: document.getElementById("submitQueryBtn"),
        clearBtn: document.getElementById("clearQueryBtn"),
      };
      modalRefs.label.textContent = apiName;
      modalRefs.desc.textContent = apiDesc;
      modalRefs.modalApiDescription.textContent = apiDesc;
      modalRefs.modalEndpointPath.textContent = apiPath.split('?')[0];
      modalRefs.queryInputContainer.innerHTML = "";
      document.getElementById("apiCurlContent").textContent = "";
      document.getElementById("apiRequestUrlContent").textContent = "";
      document.getElementById("apiResponseCode").textContent = "";
      document.getElementById("apiResponseBody").innerHTML = ""; // Gunakan innerHTML untuk reset
      document.getElementById("apiResponseHeaders").textContent = "";
      document.querySelector(".tab-button[data-tab='parameters']").click();
      document.querySelector(".response-tab-button[data-response-tab='code']").click();
      const baseApiUrl = `${window.location.origin}${apiPath.split("?")[0]}`;
      const params = new URLSearchParams(apiPath.split("?")[1]);
      let currentParams = {};
      if (params.toString()) {
        const paramContainer = document.createElement("div");
        paramContainer.className = "param-container";
        params.forEach((_, param) => {
          const paramGroup = document.createElement("div");
          paramGroup.className = "param-group";
          paramGroup.innerHTML = `<label>${param.charAt(0).toUpperCase() + param.slice(1)} <span class="required-star">*</span> <span class="param-type">string (query)</span></label><input type="text" class="form-control" placeholder="Enter ${param}..." data-param="${param}" required><p class="param-description">The query for ${param}</p><p class="param-example">Example: ${param === 'text' ? 'Hello world' : 'Paris'}</p>`;
          paramGroup.querySelector("input").addEventListener("input", (e) => {
            currentParams[param] = e.target.value.trim();
            updateCurlAndRequestUrl(baseApiUrl, currentParams);
          });
          paramContainer.appendChild(paramGroup);
        });
        if (apiInnerDesc) {
          const innerDescDiv = document.createElement("div");
          innerDescDiv.className = "text-muted mt-3";
          innerDescDiv.style.fontSize = "0.875rem";
          innerDescDiv.innerHTML = apiInnerDesc.replace(/\n/g, "<br>");
          paramContainer.appendChild(innerDescDiv);
        }
        modalRefs.queryInputContainer.appendChild(paramContainer);
        modalRefs.submitBtn.style.display = "inline-block";
        modalRefs.clearBtn.style.display = "inline-block";
        updateCurlAndRequestUrl(baseApiUrl, currentParams);
      } else {
        modalRefs.submitBtn.style.display = "none";
        modalRefs.clearBtn.style.display = "none";
        updateCurlAndRequestUrl(baseApiUrl, {});
      }
      modalRefs.submitBtn.onclick = async () => {
        const newParams = new URLSearchParams();
        let isValid = true;
        modalRefs.queryInputContainer.querySelectorAll("input").forEach((input) => {
          if (!input.value.trim()) {
            isValid = false;
            input.classList.add("is-invalid");
          } else {
            input.classList.remove("is-invalid");
            newParams.append(input.dataset.param, input.value.trim());
          }
        });
        if (isValid) {
          handleApiRequest(`${baseApiUrl}?${newParams.toString()}`, apiName);
        }
      };
      modalRefs.clearBtn.onclick = () => {
        modalRefs.queryInputContainer.querySelectorAll("input").forEach((input) => (input.value = ""));
        currentParams = {};
        updateCurlAndRequestUrl(baseApiUrl, currentParams);
      };
      modal.show();
    });

    document.querySelectorAll(".tab-button, .response-tab-button").forEach((button) => {
      button.addEventListener("click", function () {
        const isMainTab = this.classList.contains("tab-button");
        const groupClass = isMainTab ? "tab-button" : "response-tab-button";
        const paneClass = isMainTab ? ".tab-pane" : ".response-tab-pane";
        this.parentElement.querySelectorAll(`.${groupClass}`).forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");
        let tabId = isMainTab ? `${this.dataset.tab}Tab` : `response${this.dataset.responseTab.charAt(0).toUpperCase() + this.dataset.responseTab.slice(1)}Tab`;
        const parentPane = this.closest(".tab-content-wrapper") || this.closest(".modal-body");
        if (parentPane) {
          parentPane.querySelectorAll(paneClass).forEach((pane) => pane.classList.remove("active"));
          const activePane = document.getElementById(tabId);
          if (activePane) activePane.classList.add("active");
        }
      });
    });
    document.getElementById("copyCurl").addEventListener("click", () => copyToClipboard(document.getElementById("apiCurlContent").textContent, "Curl command copied!"));
    document.getElementById("copyRequestUrl").addEventListener("click", () => copyToClipboard(document.getElementById("apiRequestUrlContent").textContent, "Request URL copied!"));
    document.getElementById("downloadResponse").addEventListener("click", () => {
      const responseText = document.getElementById("apiResponseBody").textContent;
      const blob = new Blob([responseText], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "response.json";
      a.click();
      URL.revokeObjectURL(a.href);
    });
  } catch (error) {
    console.error("Error loading settings:", error);
  } finally {
    setTimeout(() => {
      loadingScreen.style.opacity = 0;
      setTimeout(() => {
        loadingScreen.style.display = "none";
        body.classList.remove("no-scroll");
      }, 300);
    }, 500);
  }
});

function copyToClipboard(text, successMessage) {
  navigator.clipboard.writeText(text).then(() => alert(successMessage)).catch((err) => console.error("Could not copy text: ", err));
}

function updateCurlAndRequestUrl(baseApiUrl, params) {
  const newParams = new URLSearchParams(params);
  const fullRequestUrl = `${baseApiUrl}${newParams.toString() ? '?' + newParams.toString() : ''}`;
  document.getElementById("apiRequestUrlContent").textContent = fullRequestUrl;
  document.getElementById("apiCurlContent").textContent = `curl -X 'GET' \\\n  '${fullRequestUrl}' \\\n  -H 'accept: */*'`;
}

// --- PERUBAHAN DI SINI: Fungsi cek status endpoint ---
async function checkEndpointsStatus(settings) {
  for (const category of settings.categories) {
    for (const item of category.items) {
      try {
        const response = await fetch(item.path, { method: 'HEAD', mode: 'cors' });
        if (!response.ok) throw new Error(`Status: ${response.status}`);
      } catch (error) {
        const card = document.querySelector(`.api-endpoint-card[data-api-path="${item.path}"]`);
        if (card) {
          const errorIcon = document.createElement('span');
          errorIcon.className = 'api-status-error';
          errorIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
          errorIcon.title = `Endpoint may be down or has CORS issues. Error: ${error.message}`;
          card.appendChild(errorIcon);
        }
      }
    }
  }
}

// --- PERUBAHAN BESAR DI SINI: handleApiRequest jadi lebih pintar ---
async function handleApiRequest(apiUrl, apiName) {
  const apiResponseCode = document.getElementById("apiResponseCode");
  const apiResponseBody = document.getElementById("apiResponseBody");
  const apiResponseHeaders = document.getElementById("apiResponseHeaders");
  
  apiResponseCode.textContent = "Loading...";
  apiResponseBody.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div>';
  apiResponseHeaders.textContent = "Loading...";
  
  document.querySelector(".tab-button[data-tab='responses']").click();

  try {
    const response = await fetch(apiUrl);
    const headers = {};
    response.headers.forEach((value, name) => { headers[name] = value; });
    apiResponseCode.textContent = response.status;
    apiResponseHeaders.textContent = Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join('\n');

    const contentType = response.headers.get("Content-Type") || "";

    if (!response.ok) {
        // Jika response tidak OK (4xx, 5xx), coba baca sebagai JSON (untuk pesan error)
        try {
            const errorData = await response.json();
            apiResponseBody.textContent = JSON.stringify(errorData, null, 2);
        } catch (e) {
            // Jika bukan JSON, baca sebagai teks biasa
            apiResponseBody.textContent = await response.text();
        }
        return; // Hentikan proses lebih lanjut
    }

    // Smart Content Preview
    if (contentType.startsWith("image/")) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      apiResponseBody.innerHTML = `<img src="${url}" alt="${apiName}" style="max-width: 100%; border-radius: 8px;">`;
    } else if (contentType.startsWith("audio/")) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      apiResponseBody.innerHTML = `<audio controls src="${url}" style="width: 100%;"></audio>`;
    } else if (contentType.startsWith("video/")) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      apiResponseBody.innerHTML = `<video controls src="${url}" style="max-width: 100%; border-radius: 8px;"></video>`;
    } else if (contentType.includes("application/json")) {
      const data = await response.json();
      apiResponseBody.textContent = JSON.stringify(data, null, 2);
    } else if (contentType.startsWith("text/")) {
      apiResponseBody.textContent = await response.text();
    } else {
      apiResponseBody.textContent = "Preview for this content type is not available. Please check the headers for more details.";
    }

  } catch (error) {
    apiResponseCode.textContent = "Error";
    apiResponseBody.textContent = `Network or other error occurred: ${error.message}`;
    apiResponseHeaders.textContent = "N/A";
  }
}
