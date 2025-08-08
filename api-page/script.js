document.addEventListener("DOMContentLoaded", async () => {
  const loadingScreen = document.getElementById("loadingScreen");
  const body = document.body;
  body.classList.add("no-scroll");

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    document.getElementById("darkModeToggle").classList.replace("fa-moon", "fa-sun");
  }

  // Theme toggle functionality
  document.getElementById("darkModeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDarkMode = document.body.classList.contains("dark-mode");

    // Save theme preference
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");

    // Toggle icon
    const icon = document.getElementById("darkModeToggle");
    if (isDarkMode) {
      icon.classList.replace("fa-moon", "fa-sun");
    } else {
      icon.classList.replace("fa-sun", "fa-moon");
    }
  });

  try {
    const settings = await fetch("/src/settings.json").then((res) => res.json());

    const setContent = (id, property, value) => {
      const element = document.getElementById(id);
      if (element) element[property] = value;
    };

    // Set current year in footer
    document.getElementById("currentYear").textContent = new Date().getFullYear();

    // Set random image from settings
    const randomImageSrc =
      Array.isArray(settings.header.imageSrc) && settings.header.imageSrc.length > 0
        ? settings.header.imageSrc[Math.floor(Math.random() * settings.header.imageSrc.length)]
        : "";

    const dynamicImage = document.getElementById("dynamicImage");
    if (dynamicImage) {
      dynamicImage.src = randomImageSrc;

      const setImageSize = () => {
        const screenWidth = window.innerWidth;
        if (screenWidth < 768) {
          dynamicImage.style.maxWidth = settings.header.imageSize.mobile || "100%";
        } else if (screenWidth < 1200) {
          dynamicImage.style.maxWidth = settings.header.imageSize.tablet || "100%";
        } else {
          dynamicImage.style.maxWidth = settings.header.imageSize.desktop || "100%";
        }
      };

      setImageSize();
      window.addEventListener("resize", setImageSize);
    }

    // Set content from settings
    setContent("page", "textContent", settings.name || "Hookrest API");
    setContent("header", "textContent", settings.name || "Hookrest API");
    setContent("footerBrand", "textContent", settings.name || "Hookrest API");
    setContent("name", "textContent", settings.name || "Hookrest API");
    setContent("copyrightName", "textContent", settings.name || "Hookrest API");
    setContent("version", "textContent", settings.version || "v1.0");
    setContent("versionHeader", "textContent", settings.header.status || "Online!");
    setContent("description", "textContent", settings.description || "Simple API's");

    // Set API links
    const apiLinksContainer = document.getElementById("apiLinks");
    if (apiLinksContainer && settings.links?.length) {
      settings.links.forEach(({ url, name }) => {
        const link = Object.assign(document.createElement("a"), {
          href: url,
          textContent: name,
          target: "_blank",
          className: "api-link",
        });
        apiLinksContainer.appendChild(link);
      });
    }

    // --- API Content Generation (Rewritten) ---
    const apiContent = document.getElementById("apiContent");
    apiContent.innerHTML = ''; // Clear existing content

    settings.categories.forEach((category) => {
      const categoryContainer = document.createElement("div");
      categoryContainer.className = "api-category-container mb-4";

      const categoryHeader = document.createElement("div");
      categoryHeader.className = "api-category-header collapsed"; // Start collapsed
      categoryHeader.setAttribute("data-bs-toggle", "collapse");
      categoryHeader.setAttribute("data-bs-target", `#collapse-${category.name.replace(/\s/g, '-')}`);
      categoryHeader.setAttribute("aria-expanded", "false");
      categoryHeader.setAttribute("aria-controls", `collapse-${category.name.replace(/\s/g, '-')}`);
      categoryHeader.innerHTML = `
        <span>${category.name}</span>
        <i class="fas fa-chevron-right"></i>
      `;
      categoryContainer.appendChild(categoryHeader);

      const categoryCollapseContent = document.createElement("div");
      categoryCollapseContent.className = "collapse api-category-content";
      categoryCollapseContent.id = `collapse-${category.name.replace(/\s/g, '-')}`;
      categoryContainer.appendChild(categoryCollapseContent);

      const sortedItems = category.items.sort((a, b) => a.name.localeCompare(b.name));

      sortedItems.forEach((item) => {
        const endpointCard = document.createElement("div");
        endpointCard.className = "api-endpoint-card";
        endpointCard.setAttribute("data-api-name", item.name);
        endpointCard.setAttribute("data-api-desc", item.desc);
        endpointCard.setAttribute("data-api-path", item.path);
        endpointCard.setAttribute("data-api-inner-desc", item.innerDesc || '');

        endpointCard.innerHTML = `
          <span class="method-badge">GET</span>
          <span class="endpoint-path">${item.path.split('?')[0]}</span>
          <span class="endpoint-name">${item.name}</span>
          <button class="toggle-details-btn" data-bs-toggle="collapse" data-bs-target="#detail-${item.name.replace(/\s/g, '-')}" aria-expanded="false" aria-controls="detail-${item.name.replace(/\s/g, '-')}" data-api-item-id="detail-${item.name.replace(/\s/g, '-')}">
            <i class="fas fa-chevron-right"></i>
          </button>
        `;
        categoryCollapseContent.appendChild(endpointCard);

        const detailContent = document.createElement("div");
        detailContent.className = "collapse api-detail-content";
        detailContent.id = `detail-${item.name.replace(/\s/g, '-')}`;
        detailContent.innerHTML = `
          <div class="description-box mb-3">
            ${item.desc}
            ${item.innerDesc ? `<br><br>${item.innerDesc.replace(/\n/g, "<br>")}` : ''}
          </div>

          <div class="tabs">
            <button class="tab-button active" data-tab="parameters" data-api-path="${item.path}">Parameters</button>
            <button class="tab-button" data-tab="try-it-out" data-api-path="${item.path}">Try it out</button>
          </div>

          <div class="tab-content-pane active" id="parameters-tab">
            <div class="param-inputs-container"></div>
            <div class="action-buttons">
              <button class="btn btn-primary execute-api-btn">Execute</button>
              <button class="btn btn-outline clear-inputs-btn">Clear</button>
            </div>
          </div>

          <div class="tab-content-pane" id="try-it-out-tab" style="display:none;">
            <div class="response-section">
              <div class="response-header">
                <span>Server response</span>
              </div>
              <div class="tabs">
                <button class="tab-button active" data-tab="response-body">Response body</button>
                <button class="tab-button" data-tab="response-headers">Response headers</button>
              </div>
              <div class="tab-content-pane active" id="response-body-tab" style="display:block;">
                <div class="api-response-loading d-none">
                  <div class="spinner">
                    <div class="double-bounce1"></div>
                    <div class="double-bounce2"></div>
                  </div>
                </div>
                <pre class="api-response-content"></pre>
                <button class="btn btn-primary download-response-btn mt-2 d-none">
                  <i class="fas fa-download"></i> Download
                </button>
              </div>
              <div class="tab-content-pane" id="response-headers-tab" style="display:none;">
                <pre class="api-response-headers"></pre>
              </div>
            </div>
          </div>
        `;
        categoryCollapseContent.appendChild(detailContent);
      });

      apiContent.appendChild(categoryContainer);
    });

    // --- Event Listeners for new API section ---

    // Toggle API category collapse
    document.querySelectorAll('.api-category-header').forEach(header => {
      header.addEventListener('click', () => {
        const icon = header.querySelector('.fas');
        const isCollapsed = header.classList.contains('collapsed');
        header.classList.toggle('collapsed', !isCollapsed);
        icon.classList.toggle('fa-chevron-right', isCollapsed);
        icon.classList.toggle('fa-chevron-down', !isCollapsed);
      });
    });

    // Toggle API endpoint details
    document.querySelectorAll('.toggle-details-btn').forEach(button => {
      button.addEventListener('click', (event) => {
        const targetId = button.dataset.bsTarget;
        const targetElement = document.querySelector(targetId);
        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        // Toggle the button's expanded state and icon
        button.setAttribute('aria-expanded', !isExpanded);
        button.classList.toggle('expanded', !isExpanded);
        button.querySelector('.fas').classList.toggle('fa-chevron-right', isExpanded);
        button.querySelector('.fas').classList.toggle('fa-chevron-down', !isExpanded);

        // Generate parameters when expanded
        if (!isExpanded) {
          const apiPath = button.closest('.api-endpoint-card').dataset.apiPath;
          const paramInputsContainer = targetElement.querySelector('.param-inputs-container');
          generateParameterInputs(apiPath, paramInputsContainer);
        }
      });
    });

    // Tab switching for Parameters/Try it out and Response Body/Headers
    document.querySelectorAll('.api-detail-content .tabs .tab-button').forEach(button => {
      button.addEventListener('click', (event) => {
        const tabName = button.dataset.tab;
        const parentTabsContainer = button.closest('.tabs');
        const detailContent = button.closest('.api-detail-content');

        // Deactivate all tabs in this group
        parentTabsContainer.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        // Hide all content panes in this group
        detailContent.querySelectorAll('.tab-content-pane').forEach(pane => pane.style.display = 'none');

        // Activate clicked tab and show its content pane
        button.classList.add('active');
        detailContent.querySelector(`#${tabName}-tab`).style.display = 'block';
      });
    });

    // Function to generate parameter input fields
    function generateParameterInputs(apiPath, container) {
      container.innerHTML = ''; // Clear previous inputs
      const urlParts = apiPath.split('?');
      const queryString = urlParts.length > 1 ? urlParts[1] : '';
      const params = new URLSearchParams(queryString);
      const paramNames = Array.from(params.keys());

      const actionButtons = container.closest('.tab-content-pane').querySelector('.action-buttons');

      if (paramNames.length === 0) {
        container.innerHTML = '<p class="text-muted">No parameters required for this endpoint.</p>';
        if (actionButtons) actionButtons.style.display = 'none';
        return;
      }

      if (actionButtons) actionButtons.style.display = 'flex';

      paramNames.forEach(param => {
        const paramGroup = document.createElement('div');
        paramGroup.className = 'param-input-group';

        const label = document.createElement('label');
        label.textContent = `${param.charAt(0).toUpperCase() + param.slice(1)}:`;
        paramGroup.appendChild(label);

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Enter ${param}`;
        input.dataset.paramName = param;
        input.required = true;
        paramGroup.appendChild(input);

        container.appendChild(paramGroup);
      });
    }

    // Execute API button
    document.querySelectorAll('.execute-api-btn').forEach(button => {
      button.addEventListener('click', async (event) => {
        const detailContent = button.closest('.api-detail-content');
        const apiPath = detailContent.querySelector('.tab-button[data-tab="parameters"]').dataset.apiPath;
        const paramInputs = detailContent.querySelectorAll('.param-inputs-container input');
        const responseContentPre = detailContent.querySelector('.api-response-content');
        const responseHeadersPre = detailContent.querySelector('.api-response-headers');
        const loadingSpinner = detailContent.querySelector('.api-response-loading');
        const downloadBtn = detailContent.querySelector('.download-response-btn');

        const newParams = new URLSearchParams();
        let isValid = true;

        paramInputs.forEach(input => {
          if (input.required && !input.value.trim()) {
            isValid = false;
            input.classList.add('is-invalid');
          } else {
            input.classList.remove('is-invalid');
            newParams.append(input.dataset.paramName, input.value.trim());
          }
        });

        if (!isValid) {
          responseContentPre.textContent = "Please fill in all required parameters.";
          responseHeadersPre.textContent = "";
          downloadBtn.classList.add('d-none');
          return;
        }

        const baseUrl = apiPath.split('?')[0];
        const fullUrl = `${window.location.origin}${baseUrl}?${newParams.toString()}`;

        responseContentPre.innerHTML = ''; // Use innerHTML for potential image
        responseHeadersPre.textContent = '';
        loadingSpinner.classList.remove('d-none');
        downloadBtn.classList.add('d-none');

        try {
          const response = await fetch(fullUrl);
          const headers = {};
          response.headers.forEach((value, name) => {
            headers[name] = value;
          });

          responseHeadersPre.textContent = JSON.stringify(headers, null, 2);

          const contentType = response.headers.get("Content-Type");
          if (contentType && contentType.startsWith("image/")) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);

            const img = document.createElement("img");
            img.src = imageUrl;
            img.alt = "API Response Image";
            img.style.maxWidth = "100%";
            img.style.height = "auto";
            img.style.borderRadius = "8px";

            responseContentPre.innerHTML = "";
            responseContentPre.appendChild(img);
            downloadBtn.classList.add('d-none'); // No download for image directly
          } else {
            const data = await response.json();
            responseContentPre.textContent = JSON.stringify(data, null, 2);
            downloadBtn.classList.remove('d-none');
            downloadBtn.onclick = () => downloadJson(data, `${detailContent.querySelector('.api-endpoint-card').dataset.apiName}.json`);
          }

        } catch (error) {
          responseContentPre.textContent = `Error: ${error.message}`;
          responseHeadersPre.textContent = "";
          downloadBtn.classList.add('d-none');
        } finally {
          loadingSpinner.classList.add('d-none');
          // Automatically switch to "Try it out" tab after execution
          const tryItOutTabButton = detailContent.querySelector(`.tab-button[data-tab="try-it-out"]`);
          const parametersTabButton = detailContent.querySelector(`.tab-button[data-tab="parameters"]`);
          const tryItOutContentPane = detailContent.querySelector(`#try-it-out-tab`);
          const parametersContentPane = detailContent.querySelector(`#parameters-tab`);

          parametersTabButton.classList.remove('active');
          tryItOutTabButton.classList.add('active');
          parametersContentPane.style.display = 'none';
          tryItOutContentPane.style.display = 'block';

          // Ensure response body tab is active within "Try it out"
          const responseBodyTabButton = detailContent.querySelector(`.tab-button[data-tab="response-body"]`);
          const responseHeadersTabButton = detailContent.querySelector(`.tab-button[data-tab="response-headers"]`);
          const responseBodyContentPane = detailContent.querySelector(`#response-body-tab`);
          const responseHeadersContentPane = detailContent.querySelector(`#response-headers-tab`);

          responseHeadersTabButton.classList.remove('active');
          responseBodyTabButton.classList.add('active');
          responseHeadersContentPane.style.display = 'none';
          responseBodyContentPane.style.display = 'block';
        }
      });
    });

    // Clear inputs button
    document.querySelectorAll('.clear-inputs-btn').forEach(button => {
      button.addEventListener('click', (event) => {
        const detailContent = button.closest('.api-detail-content');
        detailContent.querySelectorAll('.param-inputs-container input').forEach(input => {
          input.value = '';
          input.classList.remove('is-invalid');
        });
        detailContent.querySelector('.api-response-content').innerHTML = ''; // Use innerHTML for potential image
        detailContent.querySelector('.api-response-headers').textContent = '';
        detailContent.querySelector('.download-response-btn').classList.add('d-none');
      });
    });

    // Download JSON function
    function downloadJson(data, filename) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // Search functionality (updated for new structure)
    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();
      const apiCategories = document.querySelectorAll(".api-category-container");

      apiCategories.forEach(categoryContainer => {
        let categoryHasVisibleItems = false;
        const categoryCollapseContent = categoryContainer.querySelector('.api-category-content');
        const categoryHeader = categoryContainer.querySelector('.api-category-header');

        categoryCollapseContent.querySelectorAll('.api-endpoint-card').forEach(item => {
          const name = item.getAttribute("data-api-name").toLowerCase();
          const desc = item.getAttribute("data-api-desc").toLowerCase();
          const path = item.getAttribute("data-api-path").toLowerCase();

          const isVisible = name.includes(searchTerm) || desc.includes(searchTerm) || path.includes(searchTerm);
          item.style.display = isVisible ? "" : "none";

          if (isVisible) {
            categoryHasVisibleItems = true;
            // If an item is visible, ensure its detail content is hidden initially
            const detailId = item.querySelector('.toggle-details-btn').dataset.bsTarget;
            const detailElement = document.querySelector(detailId);
            if (detailElement && detailElement.classList.contains('show')) {
                new bootstrap.Collapse(detailElement, { toggle: false }).hide();
                item.querySelector('.toggle-details-btn').setAttribute('aria-expanded', 'false');
                item.querySelector('.toggle-details-btn').classList.remove('expanded');
                item.querySelector('.toggle-details-btn .fas').classList.replace('fa-chevron-down', 'fa-chevron-right');
            }
          }
        });

        // Show/hide category header based on visible items
        categoryContainer.style.display = categoryHasVisibleItems ? "" : "none";

        // If category has visible items, ensure it's expanded
        if (categoryHasVisibleItems && searchTerm.length > 0) { // Only auto-expand if searching
            if (categoryHeader.classList.contains('collapsed')) {
                new bootstrap.Collapse(categoryCollapseContent, { toggle: false }).show();
                categoryHeader.classList.remove('collapsed');
                categoryHeader.setAttribute('aria-expanded', 'true');
                categoryHeader.querySelector('.fas').classList.replace('fa-chevron-right', 'fa-chevron-down');
            }
        } else if (searchTerm.length === 0) { // Collapse all when search is cleared
            if (!categoryHeader.classList.contains('collapsed')) {
                new bootstrap.Collapse(categoryCollapseContent, { toggle: false }).hide();
                categoryHeader.classList.add('collapsed');
                categoryHeader.setAttribute('aria-expanded', 'false');
                categoryHeader.querySelector('.fas').classList.replace('fa-chevron-down', 'fa-chevron-right');
            }
        }
      });
    });


    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();

        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: "smooth",
          });

          // Update active nav link
          document.querySelectorAll(".nav-link").forEach((link) => {
            link.classList.remove("active");
          });
          this.classList.add("active");
        }
      });
    });

    // Update active nav link on scroll
    window.addEventListener("scroll", () => {
      const scrollPosition = window.scrollY;

      document.querySelectorAll("section").forEach((section) => {
        const sectionTop = section.offsetTop - 100;
        const sectionBottom = sectionTop + section.offsetHeight;
        const sectionId = section.getAttribute("id");

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          document.querySelectorAll(".nav-link").forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${sectionId}`) {
              link.classList.add("active");
            }
          });
        }
      });
    });
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
