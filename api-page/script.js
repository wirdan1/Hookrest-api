document.addEventListener("DOMContentLoaded", async () => {
  const loadingScreen = document.getElementById("loadingScreen");
  const body = document.body;
  body.classList.add("no-scroll");

  // The dark mode is already forced by default in styles.css, so this line is redundant.
  // document.body.classList.add("dark-mode");

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
                <i class="fas fa-chevron-down"></i>  Changed to fa-chevron-down 
            `;
      categoryDiv.appendChild(categoryHeader);

      const categoryBody = document.createElement("div");
      categoryBody.className = "api-category-content";
      categoryBody.style.display = "none"; // Start collapsed

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
                    <i class="fas fa-chevron-down"></i>  Added chevron-down icon 
                `;
        categoryBody.appendChild(endpointCard);
      });

      categoryDiv.appendChild(categoryBody);
      apiContent.appendChild(categoryDiv);

      // Toggle category content
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
          categoryBody.style.display = "grid"; // Ensure it's visible and grid layout
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

      const modal = new bootstrap.Modal(document.getElementById("apiResponseModal"));
      const modalRefs = {
        label: document.getElementById("apiResponseModalLabel"),
        desc: document.getElementById("apiResponseModalDesc"),
        modalApiDescription: document.getElementById("modalApiDescription"),
        modalEndpointPath: document.getElementById("modalEndpointPath"),
        queryInputContainer: document.getElementById("apiQueryInputContainer"),
        submitBtn: document.getElementById("submitQueryBtn"),
        clearBtn: document.getElementById("clearQueryBtn"),
        apiCurlContent: document.getElementById("apiCurlContent"),
        apiRequestUrlContent: document.getElementById("apiRequestUrlContent"),
        apiResponseCode: document.getElementById("apiResponseCode"),
        apiResponseBody: document.getElementById("apiResponseBody"),
        apiResponseHeaders: document.getElementById("apiResponseHeaders"),
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
      modalRefs.apiCurlContent.textContent = "";
      modalRefs.apiRequestUrlContent.textContent = "";
      modalRefs.apiResponseCode.textContent = "";
      modalRefs.apiResponseBody.textContent = "";
      modalRefs.apiResponseHeaders.textContent = "";

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

      let currentParams = {}; // To store current input values

      const validateInputs = () => {
        const inputs = modalRefs.queryInputContainer.querySelectorAll("input");
        let isValid = true;

        inputs.forEach((input) => {
          if (input.required && !input.value.trim()) {
            isValid = false;
          }
        });

        modalRefs.submitBtn.disabled = !isValid;
      };

      if (hasParams) {
        const paramContainer = document.createElement("div");
        paramContainer.className = "param-container";

        Array.from(params.keys()).forEach((param) => {
          const paramGroup = document.createElement("div");
          paramGroup.className = "param-group";

          const label = document.createElement("label");
          label.innerHTML = `${param.charAt(0).toUpperCase() + param.slice(1)} <span class="required-star">*</span> <span class="param-type">string (query)</span>`;

          const inputField = document.createElement("input");
          inputField.type = "text";
          inputField.className = "form-control";
          inputField.placeholder = `Enter ${param}...`;
          inputField.dataset.param = param;
          inputField.required = true;
          inputField.addEventListener("input", () => {
            currentParams[param] = inputField.value.trim();
            updateCurlAndRequestUrl(baseApiUrl, currentParams, apiPath.split('?')[0]);
            validateInputs();
          });

          const paramDesc = document.createElement("p");
          paramDesc.className = "param-description";
          paramDesc.textContent = `The query to ask ${param.charAt(0).toUpperCase() + param.slice(1)}`; // Generic description

          const paramExample = document.createElement("p");
          paramExample.className = "param-example";
          paramExample.textContent = `Example: ${param === 'text' ? 'Hello world' : 'Paris'}`; // Simple example

          paramGroup.appendChild(label);
          paramGroup.appendChild(inputField);
          paramGroup.appendChild(paramDesc);
          paramGroup.appendChild(paramExample);
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

        // Initial update for Curl and Request URL
        updateCurlAndRequestUrl(baseApiUrl, currentParams, apiPath.split('?')[0]);
        validateInputs();

      } else {
        modalRefs.submitBtn.style.display = "none";
        modalRefs.clearBtn.style.display = "none";
        updateCurlAndRequestUrl(baseApiUrl, {}, apiPath.split('?')[0]); // For endpoints without params
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
          modalRefs.apiResponseCode.textContent = "400";
          modalRefs.apiResponseBody.textContent = JSON.stringify({ status: false, error: "Please fill in all required fields." }, null, 2);
          modalRefs.apiResponseHeaders.textContent = "Content-Type: application/json";
          // Switch to responses tab
          document.querySelector(".tab-button[data-tab='responses']").click();
          return;
        }

        const apiUrlWithParams = `${baseApiUrl}?${newParams.toString()}`;
        handleApiRequest(apiUrlWithParams, modalRefs, apiName);
      };

      modalRefs.clearBtn.onclick = () => {
        modalRefs.queryInputContainer.querySelectorAll("input").forEach(input => {
          input.value = "";
          input.classList.remove("is-invalid");
        });
        currentParams = {};
        updateCurlAndRequestUrl(baseApiUrl, currentParams, apiPath.split('?')[0]);
        modalRefs.apiResponseCode.textContent = "";
        modalRefs.apiResponseBody.textContent = "";
        modalRefs.apiResponseHeaders.textContent = "";
        validateInputs();
      };

      modal.show();
    });

    // Tab switching logic for modal
    document.querySelectorAll(".tab-button").forEach(button => {
      button.addEventListener("click", function() {
        document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
        this.classList.add("active");
        document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
        document.getElementById(this.dataset.tab + "Tab").classList.add("active");
      });
    });

    document.querySelectorAll(".response-tab-button").forEach(button => {
      button.addEventListener("click", function() {
        document.querySelectorAll(".response-tab-button").forEach(btn => btn.classList.remove("active"));
        this.classList.add("active");
        document.querySelectorAll(".response-tab-pane").forEach(pane => pane.classList.remove("active"));
        document.getElementById(this.dataset.responseTab + "Tab").classList.add("active");
      });
    });

    // Copy functionality
    document.getElementById("copyCurl").addEventListener("click", () => {
      const text = document.getElementById("apiCurlContent").textContent;
      copyToClipboard(text, "Curl command copied to clipboard!");
    });

    document.getElementById("copyRequestUrl").addEventListener("click", () => {
      const text = document.getElementById("apiRequestUrlContent").textContent;
      copyToClipboard(text, "Request URL copied to clipboard!");
    });

    document.getElementById("downloadResponse").addEventListener("click", () => {
      const responseText = document.getElementById("apiResponseBody").textContent;
      const filename = "response.json";
      const blob = new Blob([responseText], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert("Response downloaded!");
    });

    function copyToClipboard(text, successMessage) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          alert(successMessage);
        })
        .catch((err) => {
          console.error("Could not copy text: ", err);
        });
    }

    function updateCurlAndRequestUrl(baseApiUrl, params, endpointPath) {
      const newParams = new URLSearchParams();
      for (const key in params) {
        if (params[key]) {
          newParams.append(key, params[key]);
        }
      }

      const fullRequestUrl = `${baseApiUrl}${newParams.toString() ? '?' + newParams.toString() : ''}`;
      document.getElementById("apiRequestUrlContent").textContent = fullRequestUrl;

      const curlCommand = `curl -X 'GET' \\\n  '${fullRequestUrl}' \\\n  -H 'accept: */*'`;
      document.getElementById("apiCurlContent").textContent = curlCommand;
    }

    async function handleApiRequest(apiUrl, modalRefs, apiName) {
      modalRefs.apiResponseCode.textContent = "Loading...";
      modalRefs.apiResponseBody.textContent = "Loading...";
      modalRefs.apiResponseHeaders.textContent = "Loading...";

      // Switch to responses tab and code tab
      document.querySelector(".tab-button[data-tab='responses']").click();
      document.querySelector(".response-tab-button[data-response-tab='code']").click();

      try {
        const response = await fetch(apiUrl);
        const headers = {};
        response.headers.forEach((value, name) => {
          headers[name] = value;
        });

        modalRefs.apiResponseCode.textContent = response.status;
        modalRefs.apiResponseHeaders.textContent = Object.entries(headers).map(([key, value]) => `${key}: ${value}`).join('\n');

        const contentType = response.headers.get("Content-Type");
        let responseBodyContent;

        if (contentType && contentType.startsWith("image/")) {
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);

          const img = document.createElement("img");
          img.src = imageUrl;
          img.alt = apiName;
          img.style.maxWidth = "100%";
          img.style.height = "auto";
          img.style.borderRadius = "8px";

          modalRefs.apiResponseBody.innerHTML = ""; // Clear previous content
          modalRefs.apiResponseBody.appendChild(img);
        } else {
          // Attempt to parse as JSON first
          try {
            const data = await response.json();
            responseBodyContent = JSON.stringify(data, null, 2);
          } catch (jsonError) {
            // If JSON parsing fails, get as plain text
            responseBodyContent = await response.text();
            if (!responseBodyContent) {
              responseBodyContent = `No response body for status ${response.status}`;
            }
          }
          modalRefs.apiResponseBody.textContent = responseBodyContent;
        }

      } catch (error) {
        // This catch block is for network errors or issues before getting a response object
        modalRefs.apiResponseCode.textContent = "Error"; // More general error
        modalRefs.apiResponseBody.textContent = JSON.stringify({ status: false, error: `Network or client-side error: ${error.message}` }, null, 2);
        modalRefs.apiResponseHeaders.textContent = "Content-Type: application/json";
      }
    }

  } catch (error) {
    console.error("Error loading settings:", error);
  } finally {
    // Simulate loading for better UX
    setTimeout(() => {
      loadingScreen.style.opacity = 0;
      setTimeout(() => {
        loadingScreen.style.display = "none";
        body.classList.remove("no-scroll");
      }, 300);
    }, 1500);
  }
});
