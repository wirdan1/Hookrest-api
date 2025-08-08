document.addEventListener("DOMContentLoaded", async () => {
  const loadingScreen = document.getElementById("loadingScreen");
  const body = document.body;
  body.classList.add("no-scroll");
  document.body.classList.add("dark-mode");

  try {
    // 1. Load settings.json dengan error handling
    const settingsResponse = await fetch("/src/settings.json");
    
    if (!settingsResponse.ok) {
      throw new Error(`Failed to load settings: ${settingsResponse.status}`);
    }
    
    const settings = await settingsResponse.json();
    
    // 2. Validasi struktur data
    if (!settings.categories || !Array.isArray(settings.categories)) {
      throw new Error("Invalid settings format: categories missing or not an array");
    }

    // Fungsi helper untuk set konten
    const setContent = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    };

    // Set informasi dasar
    setContent("page", settings.name || "API Documentation");
    setContent("header", settings.name || "API Documentation");
    setContent("footerBrand", settings.name || "API Documentation");
    setContent("name", settings.name || "API Documentation");
    setContent("copyrightName", settings.name || "API Documentation");
    setContent("description", settings.description || "API Endpoints Documentation");
    setContent("currentYear", new Date().getFullYear());

    // 3. Generate API content
    const apiContent = document.getElementById("apiContent");
    apiContent.innerHTML = "";

    settings.categories.forEach((category) => {
      if (!category.name || !category.items) return;

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

      // Sort items by name
      const sortedItems = [...category.items].sort((a, b) => (a.name || "").localeCompare(b.name || ""));

      sortedItems.forEach((item) => {
        if (!item.path || !item.name) return;

        const endpointCard = document.createElement("div");
        endpointCard.className = "api-endpoint-card";
        endpointCard.dataset.apiPath = item.path;
        endpointCard.dataset.apiName = item.name;
        endpointCard.dataset.apiDesc = item.desc || "";
        endpointCard.dataset.apiInnerDesc = item.innerDesc || "";

        endpointCard.innerHTML = `
          <span class="method-badge">GET</span>
          <div class="endpoint-text">
            <span class="endpoint-path">${item.path.split('?')[0]}</span>
            <span class="endpoint-name">${item.name}</span>
          </div>
          <i class="fas fa-chevron-down"></i>
        `;
        categoryBody.appendChild(endpointCard);
      });

      categoryDiv.appendChild(categoryBody);
      apiContent.appendChild(categoryDiv);

      // Toggle category
      categoryHeader.addEventListener("click", () => {
        const isCollapsed = categoryBody.style.display === "none";
        categoryBody.style.display = isCollapsed ? "grid" : "none";
        const icon = categoryHeader.querySelector("i");
        icon.classList.toggle("fa-chevron-up", isCollapsed);
        icon.classList.toggle("fa-chevron-down", !isCollapsed);
      });
    });

    // 4. Search functionality
    document.getElementById("searchInput").addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      document.querySelectorAll(".api-endpoint-card").forEach(card => {
        const name = card.dataset.apiName.toLowerCase();
        const path = card.dataset.apiPath.toLowerCase();
        card.style.display = name.includes(term) || path.includes(term) ? "flex" : "none";
      });

      document.querySelectorAll(".api-category").forEach(category => {
        const body = category.querySelector(".api-category-content");
        const hasVisibleItems = body.querySelector('.api-endpoint-card[style*="flex"]');
        category.style.display = hasVisibleItems ? "block" : "none";
      });
    });

    // 5. Handle endpoint clicks
    document.addEventListener("click", async (e) => {
      const card = e.target.closest(".api-endpoint-card");
      if (!card) return;

      const { apiPath, apiName, apiDesc } = card.dataset;
      const modal = new bootstrap.Modal(document.getElementById("apiResponseModal"));
      
      // Set modal content
      document.getElementById("apiResponseModalLabel").textContent = apiName;
      document.getElementById("apiResponseModalDesc").textContent = apiDesc;
      document.getElementById("modalApiDescription").textContent = apiDesc;
      document.getElementById("modalEndpointPath").textContent = apiPath.split('?')[0];

      // Reset response sections
      document.getElementById("apiResponseCode").textContent = "";
      document.getElementById("apiResponseBody").textContent = "";
      document.getElementById("apiResponseHeaders").textContent = "";

      // Handle parameters
      const queryContainer = document.getElementById("apiQueryInputContainer");
      queryContainer.innerHTML = "";
      
      const baseUrl = window.location.origin + apiPath.split('?')[0];
      const queryParams = new URLSearchParams(apiPath.split('?')[1] || "");
      const params = {};

      if (queryParams.toString()) {
        Array.from(queryParams.keys()).forEach(param => {
          const group = document.createElement("div");
          group.className = "param-group";
          
          group.innerHTML = `
            <label>${param} <span class="required-star">*</span> <span class="param-type">string</span></label>
            <input type="text" class="form-control" data-param="${param}" placeholder="Enter ${param}">
            <p class="param-description">Parameter ${param}</p>
          `;
          
          group.querySelector("input").addEventListener("input", (e) => {
            params[param] = e.target.value;
            updateRequestInfo(baseUrl, params);
          });
          
          queryContainer.appendChild(group);
        });
        
        document.getElementById("submitQueryBtn").style.display = "block";
        document.getElementById("clearQueryBtn").style.display = "block";
      } else {
        document.getElementById("submitQueryBtn").style.display = "none";
        document.getElementById("clearQueryBtn").style.display = "none";
      }

      // Initial request info
      updateRequestInfo(baseUrl, {});

      // Submit button handler
      document.getElementById("submitQueryBtn").onclick = async () => {
        try {
          const query = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value) query.append(key, value);
          });

          const url = baseUrl + (query.toString() ? `?${query.toString()}` : "");
          await fetchAndDisplayResponse(url, apiName);
        } catch (error) {
          console.error("API request failed:", error);
          document.getElementById("apiResponseCode").textContent = "Error";
          document.getElementById("apiResponseBody").textContent = JSON.stringify({
            error: error.message
          }, null, 2);
        }
      };

      // Clear button handler
      document.getElementById("clearQueryBtn").onclick = () => {
        queryContainer.querySelectorAll("input").forEach(input => {
          input.value = "";
          params[input.dataset.param] = "";
        });
        updateRequestInfo(baseUrl, {});
        document.getElementById("apiResponseCode").textContent = "";
        document.getElementById("apiResponseBody").textContent = "";
        document.getElementById("apiResponseHeaders").textContent = "";
      };

      // Show modal
      modal.show();
    });

    // Helper function to update request info
    function updateRequestInfo(baseUrl, params) {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) query.append(key, value);
      });

      const url = baseUrl + (query.toString() ? `?${query.toString()}` : "");
      
      // Update request URL
      document.getElementById("apiRequestUrlContent").textContent = url;
      
      // Update cURL command
      document.getElementById("apiCurlContent").textContent = `curl -X GET '${url}'`;
    }

    // Helper function to fetch and display response
    async function fetchAndDisplayResponse(url, apiName) {
      const codeEl = document.getElementById("apiResponseCode");
      const bodyEl = document.getElementById("apiResponseBody");
      const headersEl = document.getElementById("apiResponseHeaders");

      codeEl.textContent = "Loading...";
      bodyEl.textContent = "Loading...";
      headersEl.textContent = "Loading...";

      try {
        const response = await fetch(url);
        
        // Display status code
        codeEl.textContent = response.status;
        
        // Display headers
        const headers = {};
        response.headers.forEach((value, name) => {
          headers[name] = value;
        });
        headersEl.textContent = JSON.stringify(headers, null, 2);
        
        // Display response body
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          bodyEl.textContent = JSON.stringify(await response.json(), null, 2);
        } else if (contentType.startsWith("text/")) {
          bodyEl.textContent = await response.text();
        } else {
          bodyEl.textContent = "Unsupported content type: " + contentType;
        }
      } catch (error) {
        codeEl.textContent = "Error";
        bodyEl.textContent = JSON.stringify({
          error: error.message
        }, null, 2);
        headersEl.textContent = "";
      }
    }

  } catch (error) {
    console.error("Initialization error:", error);
    loadingScreen.querySelector("p").textContent = "Failed to load documentation. Please check console.";
  } finally {
    setTimeout(() => {
      loadingScreen.style.opacity = "0";
      setTimeout(() => {
        loadingScreen.style.display = "none";
        body.classList.remove("no-scroll");
      }, 300);
    }, 800);
  }
});
