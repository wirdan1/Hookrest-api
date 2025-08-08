document.addEventListener("DOMContentLoaded", async () => {
  const loadingScreen = document.getElementById("loadingScreen");
  const body = document.body;
  body.classList.add("no-scroll");

  // Force dark mode for this design
  document.body.classList.add("dark-mode");

  try {
    const settings = await fetch("/src/settings.json").then((res) => res.json());

    const setContent = (id, property, value) => {
      const element = document.getElementById(id);
      if (element) element[property] = value;
    };

    // Set current year in footer
    document.getElementById("currentYear").textContent = new Date().getFullYear();

    // Set content from settings
    setContent("page", "textContent", settings.name || "Hookrest API");
    setContent("header", "textContent", settings.name || "Hookrest API");
    setContent("footerBrand", "textContent", settings.name || "Hookrest API");
    setContent("name", "textContent", settings.name || "Hookrest API");
    setContent("copyrightName", "textContent", settings.name || "Hookrest API");
    setContent("description", "textContent", settings.description || "Simple API's");

    // Generate API content
    const apiContent = document.getElementById("apiContent");
    settings.categories.forEach((category) => {
      const categoryDiv = document.createElement("div");
      categoryDiv.className = "api-category";

      const categoryHeader = document.createElement("div");
      categoryHeader.className = "api-category-header";
      categoryHeader.innerHTML = `
                  <span>${category.name}</span>
                  <i class="fas fa-chevron-down"></i>
              `;
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

        endpointCard.innerHTML = `
                      <span class="method-badge">GET</span>
                      <div class="endpoint-text">
                          <span class="endpoint-path">${item.path.split('?')[0]}</span>
                          <span class="endpoint-name">${item.name}</span>
                      </div>
                      <i class="fas fa-lock lock-icon"></i>
                      <i class="fas fa-chevron-down"></i>
                  `;
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

    // Search functionality
    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();
      const apiItems = document.querySelectorAll(".api-endpoint-card");
      const categoryDivs = document.querySelectorAll(".api-category");

      apiItems.forEach((item) => {
        const name = item.getAttribute("data-api-name").toLowerCase();
        const path = item.getAttribute("data-api-path").toLowerCase();
        item.style.display = name.includes(searchTerm) || path.includes(searchTerm) ? "flex" : "none";
      });

      categoryDivs.forEach((categoryDiv) => {
        const categoryBody = categoryDiv.querySelector(".api-category-content");
        const categoryHeader = categoryDiv.querySelector(".api-category-header");
        const visibleItems = categoryBody.querySelectorAll('.api-endpoint-card[style*="display: flex"]');
        
        if (visibleItems.length > 0) {
          categoryDiv.style.display = "";
          categoryBody.style.display = "grid";
          categoryHeader.classList.remove("collapsed");
          categoryHeader.querySelector(".fas").classList.replace("fa-chevron-down", "fa-chevron-up");
        } else {
          categoryDiv.style.display = "none";
        }
      });
    });

    // API request handling (Modal logic)
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".api-endpoint-card")) return;

      const card = event.target.closest(".api-endpoint-card");
      const { apiPath, apiName, apiDesc, apiInnerDesc } = card.dataset;

      const modalElement = document.getElementById("apiResponseModal");
      const modal = new bootstrap.Modal(modalElement);
      
      const modalRefs = {
        label: document.getElementById("apiResponseModalLabel"),
        desc: document.getElementById("apiResponseModalDesc"),
        modalApiDescription: document.getElementById("modalApiDescription"),
        modalEndpointPath: document.getElementById("modalEndpointPath"),
        queryInputContainer: document.getElementById("apiQueryInputContainer"),
        submitBtn: document.getElementById("submitQueryBtn"),
        clearBtn: document.getElementById("clearQueryBtn"),
        parametersTab: document.getElementById("parametersTab"),
        responsesTab: document.getElementById("responsesTab"),
        responseCodeTab: document.getElementById("responseCodeTab"),
        responseDetailsTab: document.getElementById("responseDetailsTab"),
      };

      // Reset modal content
      modalRefs.label.textContent = apiName;
      modalRefs.desc.textContent = apiDesc;
      modalRefs.modalApiDescription.textContent = apiDesc;
      modalRefs.modalEndpointPath.textContent = apiPath.split('?')[0];
      modalRefs.queryInputContainer.innerHTML = "";
      document.getElementById("apiCurlContent").textContent = "";
      document.getElementById("apiRequestUrlContent").textContent = "";
      document.getElementById("apiResponseCode").textContent = "";
      document.getElementById("apiResponseBody").textContent = "";
      document.getElementById("apiResponseHeaders").textContent = "";

      // Reset tab states
      document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
      document.querySelector(".tab-button[data-tab='parameters']").classList.add("active");
      modalRefs.parametersTab.classList.add("active");
      modalRefs.responsesTab.classList.remove("active");

      document.querySelectorAll(".response-tab-button").forEach(btn => btn.classList.remove("active"));
      document.querySelector(".response-tab-button[data-response-tab='code']").classList.add("active");
      modalRefs.responseCodeTab.classList.add("active");
      modalRefs.responseDetailsTab.classList.remove("active");

      const baseApiUrl = `${window.location.origin}${apiPath.split("?")[0]}`;
      const paramsString = apiPath.split("?")[1];
      const params = new URLSearchParams(paramsString);
      const hasParams = params.toString().length > 0;

      let currentParams = {};

      if (hasParams) {
        const paramContainer = document.createElement("div");
        paramContainer.className = "param-container";

        Array.from(params.keys()).forEach((param) => {
          const paramGroup = document.createElement("div");
          paramGroup.className = "param-group";
          paramGroup.innerHTML = `
            <label>${param.charAt(0).toUpperCase() + param.slice(1)} <span class="required-star">*</span> <span class="param-type">string (query)</span></label>
            <input type="text" class="form-control" placeholder="Enter ${param}..." data-param="${param}" required>
            <p class="param-description">The query to ask ${param.charAt(0).toUpperCase() + param.slice(1)}</p>
            <p class="param-example">Example: ${param === 'text' ? 'Hello world' : 'Paris'}</p>
          `;
          const inputField = paramGroup.querySelector("input");
          inputField.addEventListener("input", () => {
            currentParams[param] = inputField.value.trim();
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
        const inputs = modalRefs.queryInputContainer.querySelectorAll("input");
        const newParams = new URLSearchParams();
        let isValid = true;

        inputs.forEach((input) => {
          if (input.required && !input.value.trim()) {
            isValid = false;
            input.classList.add("is-invalid");
          } else {
            input.classList.remove("is-invalid");
            newParams.append(input.dataset.param, input.value.trim());
          }
        });
        
        if (!isValid) {
          document.getElementById("apiResponseCode").textContent = "400";
          document.getElementById("apiResponseBody").textContent = JSON.stringify({ status: false, error: "Please fill in all required fields." }, null, 2);
          document.getElementById("apiResponseHeaders").textContent = "Content-Type: application/json";
          document.querySelector(".tab-button[data-tab='responses']").click();
          return;
        }

        const apiUrlWithParams = `${baseApiUrl}?${newParams.toString()}`;
        // Perubahan di sini: Tidak perlu lagi mengirim modalRefs
        handleApiRequest(apiUrlWithParams, apiName);
      };

      modalRefs.clearBtn.onclick = () => {
        modalRefs.queryInputContainer.querySelectorAll("input").forEach(input => {
          input.value = "";
          input.classList.remove("is-invalid");
        });
        currentParams = {};
        updateCurlAndRequestUrl(baseApiUrl, currentParams);
        document.getElementById("apiResponseCode").textContent = "";
        document.getElementById("apiResponseBody").textContent = "";
        document.getElementById("apiResponseHeaders").textContent = "";
      };

      modal.show();
    });

    // Tab switching logic
    document.querySelectorAll(".tab-button, .response-tab-button").forEach(button => {
      button.addEventListener("click", function() {
        const group = this.classList.contains('tab-button') ? 'tab' : 'response-tab';
        this.parentElement.querySelectorAll(`.${group}-button`).forEach(btn => btn.classList.remove("active"));
        this.classList.add("active");
        
        const contentSelector = group === 'tab' ? '.tab-pane' : '.response-tab-pane';
        const tabId = group === 'tab' ? this.dataset.tab + "Tab" : this.dataset.responseTab + "Tab";
        
        document.querySelectorAll(contentSelector).forEach(pane => pane.classList.remove("active"));
        document.getElementById(tabId).classList.add("active");
      });
    });

    // Copy and Download functionality
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
      alert("Response downloaded!");
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
    }, 1500);
  }
});

function copyToClipboard(text, successMessage) {
  navigator.clipboard.writeText(text).then(() => alert(successMessage)).catch(err => console.error("Could not copy text: ", err));
}

function updateCurlAndRequestUrl(baseApiUrl, params) {
  const newParams = new URLSearchParams(params);
  const fullRequestUrl = `${baseApiUrl}${newParams.toString() ? '?' + newParams.toString() : ''}`;
  document.getElementById("apiRequestUrlContent").textContent = fullRequestUrl;
  document.getElementById("apiCurlContent").textContent = `curl -X 'GET' \\\n  '${fullRequestUrl}' \\\n  -H 'accept: */*'`;
}

// Perubahan utama di fungsi ini
async function handleApiRequest(apiUrl, apiName) {
  // 1. Ambil elemen-elemennya langsung di sini
  const apiResponseCode = document.getElementById("apiResponseCode");
  const apiResponseBody = document.getElementById("apiResponseBody");
  const apiResponseHeaders = document.getElementById("apiResponseHeaders");

  // Pastikan elemennya ada sebelum melanjutkan
  if (!apiResponseCode || !apiResponseBody || !apiResponseHeaders) {
    console.error("Modal response elements not found!");
    return;
  }

  // 2. Set status loading
  apiResponseCode.textContent = "Loading...";
  apiResponseBody.textContent = "Loading...";
  apiResponseHeaders.textContent = "Loading...";

  // Pindah tab secara otomatis
  document.querySelector(".tab-button[data-tab='responses']").click();
  document.querySelector(".response-tab-button[data-response-tab='code']").click();

  try {
    const response = await fetch(apiUrl);
    const headers = {};
    response.headers.forEach((value, name) => { headers[name] = value; });

    // 3. Update UI dengan hasil fetch
    apiResponseCode.textContent = response.status;
    apiResponseHeaders.textContent = Object.entries(headers).map(([key, value]) => `${key}: ${value}`).join('\n');

    const contentType = response.headers.get("Content-Type") || "";
    if (contentType.startsWith("image/")) {
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      apiResponseBody.innerHTML = `<img src="${imageUrl}" alt="${apiName}" style="max-width: 100%; height: auto; border-radius: 8px;">`;
    } else {
      const data = await response.json();
      apiResponseBody.textContent = JSON.stringify(data, null, 2);
    }
  } catch (error) {
    apiResponseCode.textContent = "500";
    apiResponseBody.textContent = JSON.stringify({ status: false, error: error.message }, null, 2);
    apiResponseHeaders.textContent = "Content-Type: application/json";
  }
}
