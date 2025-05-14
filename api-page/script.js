document.addEventListener("DOMContentLoaded", async () => {
  const loadingScreen = document.getElementById("loadingScreen")
  const body = document.body
  body.classList.add("no-scroll")

  // API Status checking functionality
  const checkApiStatus = async (apiPath) => {
    if (!apiPath) return { status: false, message: "Invalid API path" }

    try {
      // Extract the base path without query parameters
      const basePath = apiPath.split("?")[0]

      // Create a proper test URL based on the API structure
      // For endpoints that require parameters, we'll add dummy values
      let testUrl = `${window.location.origin}${basePath}`

      // Add minimal required parameters based on the endpoint pattern
      if (apiPath.includes("?")) {
        const params = new URLSearchParams(apiPath.split("?")[1])
        const newParams = new URLSearchParams()

        // Add minimal valid test values for common parameter types
        params.forEach((_, key) => {
          if (key === "url") newParams.append(key, "https://example.com")
          else if (key === "q" || key === "query" || key === "text" || key === "content" || key === "prompt")
            newParams.append(key, "test")
          else if (key === "nama" || key === "name") newParams.append(key, "test")
          else if (key === "city" || key === "kota") newParams.append(key, "jakarta")
          else if (key === "no") newParams.append(key, "1")
          else if (key === "count") newParams.append(key, "1")
          else if (key === "form") newParams.append(key, "test")
          else if (key === "model") newParams.append(key, "gpt")
          else if (key === "delay") newParams.append(key, "100")
          else newParams.append(key, "test")
        })

        if (newParams.toString()) {
          testUrl += `?${newParams.toString()}`
        }
      }

      // Create a controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 8 second timeout (increased from 5)

      // Try a GET request instead of HEAD (more universally supported)
      const response = await fetch(testUrl, {
        method: "GET",
        signal: controller.signal,
        headers: {
          Accept: "application/json, text/plain, */*",
        },
      })

      clearTimeout(timeoutId)

      /* Consider 2xx and 3xx status codes as "online"
      const isOnline = response.status >= 200 && response.status < 400

      return {
        status: isOnline,
        message: isOnline ? "Online" : `Offline (${response.status})`,
        statusCode: response.status,
      }
    } catch (error) {
      console.log(`API check error for ${apiPath}:`, error.message)
      // Check if it's a timeout error
      if (error.name === "AbortError") {
        return { status: false, message: "Timeout" }
      }
      return { status: false, message: "Offline" }
    }
  } */

  // Update API status indicators
  const updateApiStatusIndicators = async () => {
    const apiItems = document.querySelectorAll(".api-item")

    for (const item of apiItems) {
      const apiPath = item.querySelector(".get-api-btn")?.dataset.apiPath
      if (!apiPath) continue

      const statusElement = item.querySelector(".api-status")
      if (statusElement) {
        const indicator = statusElement.querySelector(".status-indicator")
        const statusText = statusElement.querySelector(".api-status-text")

        indicator.className = "status-indicator status-checking"
        statusText.textContent = "Checking..."

        const { status, message } = await checkApiStatus(apiPath)

        indicator.className = `status-indicator ${status ? "status-online" : "status-offline"}`
        statusText.textContent = message
      }
    }
  }

  // Update mobile status bar
  const updateMobileStatusBar = () => {
    const mobileStatusBar = document.getElementById("mobileStatusBar")
    if (!mobileStatusBar) return

    const indicator = mobileStatusBar.querySelector(".mobile-status-indicator")
    const statusText = mobileStatusBar.querySelector(".mobile-status-text")

    // Count online and total APIs
    const apiItems = document.querySelectorAll(".api-item")
    let totalApis = 0
    let onlineApis = 0

    apiItems.forEach((item) => {
      totalApis++
      const statusIndicator = item.querySelector(".status-indicator")
      if (statusIndicator && statusIndicator.classList.contains("status-online")) {
        onlineApis++
      }
    })

    // Update the status bar
    if (onlineApis === totalApis) {
      indicator.style.backgroundColor = "var(--success-color)"
      statusText.textContent = `All APIs Online (${onlineApis}/${totalApis})`
    } else if (onlineApis === 0) {
      indicator.style.backgroundColor = "var(--danger-color)"
      statusText.textContent = `All APIs Offline (0/${totalApis})`
    } else {
      indicator.style.backgroundColor = "var(--warning-color)"
      statusText.textContent = `Some APIs Offline (${onlineApis}/${totalApis})`
    }
  }

  // Add this function after the updateMobileStatusBar function (around line 60)
  const showStatusToast = (status, message) => {
    const toast = document.getElementById("statusToast")
    const toastTitle = document.getElementById("toastTitle")
    const toastMessage = document.getElementById("toastMessage")
    const statusIndicator = document.getElementById("toastStatusIndicator")

    if (!toast) return

    // Set toast content
    toastTitle.textContent = status ? "API Online" : "API Offline"
    toastMessage.textContent = message
    statusIndicator.className = `status-indicator ${status ? "status-online" : "status-offline"}`

    // Show the toast
    const bsToast = new bootstrap.Toast(toast)
    bsToast.show()
  }

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode")
    document.getElementById("darkModeToggle").classList.replace("fa-moon", "fa-sun")
  }

  // Theme toggle functionality
  document.getElementById("darkModeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode")
    const isDarkMode = document.body.classList.contains("dark-mode")

    // Save theme preference
    localStorage.setItem("theme", isDarkMode ? "dark" : "light")

    // Toggle icon
    const icon = document.getElementById("darkModeToggle")
    if (isDarkMode) {
      icon.classList.replace("fa-moon", "fa-sun")
    } else {
      icon.classList.replace("fa-sun", "fa-moon")
    }
  })

  try {
    const settings = await fetch("/src/settings.json").then((res) => res.json())

    const setContent = (id, property, value) => {
      const element = document.getElementById(id)
      if (element) element[property] = value
    }

    // Set current year in footer
    document.getElementById("currentYear").textContent = new Date().getFullYear()

    // Set random image from settings
    const randomImageSrc =
      Array.isArray(settings.header.imageSrc) && settings.header.imageSrc.length > 0
        ? settings.header.imageSrc[Math.floor(Math.random() * settings.header.imageSrc.length)]
        : ""

    const dynamicImage = document.getElementById("dynamicImage")
    if (dynamicImage) {
      dynamicImage.src = randomImageSrc

      const setImageSize = () => {
        const screenWidth = window.innerWidth
        if (screenWidth < 768) {
          dynamicImage.style.maxWidth = settings.header.imageSize.mobile || "100%"
        } else if (screenWidth < 1200) {
          dynamicImage.style.maxWidth = settings.header.imageSize.tablet || "100%"
        } else {
          dynamicImage.style.maxWidth = settings.header.imageSize.desktop || "100%"
        }
      }

      setImageSize()
      window.addEventListener("resize", setImageSize)
    }

    // Set content from settings
    setContent("page", "textContent", settings.name || "Hookrest API")
    setContent("header", "textContent", settings.name || "Hookrest API")
    setContent("footerBrand", "textContent", settings.name || "Hookrest API")
    setContent("name", "textContent", settings.name || "Hookrest API")
    setContent("copyrightName", "textContent", settings.name || "Hookrest API")
    setContent("version", "textContent", settings.version || "v1.0")
    setContent("versionHeader", "textContent", settings.header.status || "Online!")
    setContent("description", "textContent", settings.description || "Simple API's")

    // Set API links
    const apiLinksContainer = document.getElementById("apiLinks")
    if (apiLinksContainer && settings.links?.length) {
      settings.links.forEach(({ url, name }) => {
        const link = Object.assign(document.createElement("a"), {
          href: url,
          textContent: name,
          target: "_blank",
          className: "api-link",
        })
        apiLinksContainer.appendChild(link)
      })
    }

    // Generate API content
    const apiContent = document.getElementById("apiContent")
    settings.categories.forEach((category) => {
      const sortedItems = category.items.sort((a, b) => a.name.localeCompare(b.name))

      const categoryHeader = document.createElement("h3")
      categoryHeader.className = "category-header"
      categoryHeader.textContent = category.name
      apiContent.appendChild(categoryHeader)

      const rowDiv = document.createElement("div")
      rowDiv.className = "row"

      sortedItems.forEach((item) => {
        const colDiv = document.createElement("div")
        colDiv.className = "col-md-6 col-lg-4 api-item"
        colDiv.dataset.name = item.name
        colDiv.dataset.desc = item.desc

        const heroSection = document.createElement("div")
        heroSection.className = "hero-section"

        const contentDiv = document.createElement("div")

        const heading = document.createElement("h5")
        heading.textContent = item.name

        const description = document.createElement("p")
        description.className = "text-muted"
        description.textContent = item.desc

        contentDiv.appendChild(heading)
        contentDiv.appendChild(description)

        // Add API status indicator
        const statusDiv = document.createElement("div")
        statusDiv.className = "api-status"

        const statusIndicator = document.createElement("span")
        statusIndicator.className = "status-indicator status-checking"

        const statusText = document.createElement("span")
        statusText.className = "api-status-text"
        statusText.textContent = "Checking..."

        statusDiv.appendChild(statusIndicator)
        statusDiv.appendChild(statusText)

        const button = document.createElement("button")
        button.className = "get-api-btn"
        button.textContent = "GET"
        button.dataset.apiPath = item.path
        button.dataset.apiName = item.name
        button.dataset.apiDesc = item.desc

        heroSection.appendChild(contentDiv)
        heroSection.appendChild(statusDiv)
        heroSection.appendChild(button)

        colDiv.appendChild(heroSection)
        rowDiv.appendChild(colDiv)
      })

      apiContent.appendChild(rowDiv)
    })

    // Search functionality
    const searchInput = document.getElementById("searchInput")
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase()
      const apiItems = document.querySelectorAll(".api-item")
      const categoryHeaders = document.querySelectorAll(".category-header")

      apiItems.forEach((item) => {
        const name = item.getAttribute("data-name").toLowerCase()
        const desc = item.getAttribute("data-desc").toLowerCase()
        item.style.display = name.includes(searchTerm) || desc.includes(searchTerm) ? "" : "none"
      })

      categoryHeaders.forEach((header) => {
        const categoryRow = header.nextElementSibling
        const visibleItems = categoryRow.querySelectorAll('.api-item:not([style*="display: none"])')
        header.style.display = visibleItems.length ? "" : "none"
        categoryRow.style.display = visibleItems.length ? "" : "none"
      })
    })

    // Start checking API statuses after page load
    setTimeout(() => {
      updateApiStatusIndicators().then(() => {
        updateMobileStatusBar()
      })

      // Refresh status every 5 minutes
      setInterval(() => {
        updateApiStatusIndicators().then(() => {
          updateMobileStatusBar()
        })
      }, 300000)
    }, 2000)

    // Enhance the API modal to automatically test endpoints when opened
    // Modify the API request handling section (around line 130)
    // Replace the document.addEventListener("click", (event) => { ... }) block with:

    document.addEventListener("click", (event) => {
      if (!event.target.classList.contains("get-api-btn")) return

      const { apiPath, apiName, apiDesc } = event.target.dataset
      // Declare bootstrap here
      const modal = new bootstrap.Modal(document.getElementById("apiResponseModal"))
      const modalRefs = {
        label: document.getElementById("apiResponseModalLabel"),
        desc: document.getElementById("apiResponseModalDesc"),
        content: document.getElementById("apiResponseContent"),
        endpoint: document.getElementById("apiEndpoint"),
        spinner: document.getElementById("apiResponseLoading"),
        queryInputContainer: document.getElementById("apiQueryInputContainer"),
        submitBtn: document.getElementById("submitQueryBtn"),
        responseContainer: document.getElementById("responseContainer"),
      }

      modalRefs.label.textContent = apiName
      modalRefs.desc.textContent = apiDesc
      modalRefs.content.textContent = ""
      modalRefs.endpoint.textContent = ""
      modalRefs.spinner.classList.add("d-none")
      modalRefs.responseContainer.classList.add("d-none")

      modalRefs.queryInputContainer.innerHTML = ""
      modalRefs.submitBtn.classList.add("d-none")

      const baseApiUrl = `${window.location.origin}${apiPath}`
      const params = new URLSearchParams(apiPath.split("?")[1])
      const hasParams = params.toString().length > 0

      if (hasParams) {
        const paramContainer = document.createElement("div")
        paramContainer.className = "param-container"

        const paramsArray = Array.from(params.keys())

        paramsArray.forEach((param, index) => {
          const paramGroup = document.createElement("div")
          paramGroup.className = index < paramsArray.length - 1 ? "mb-3" : ""

          const label = document.createElement("label")
          label.className = "form-label"
          label.textContent = `${param.charAt(0).toUpperCase() + param.slice(1)}`

          const inputField = document.createElement("input")
          inputField.type = "text"
          inputField.className = "form-control"
          inputField.placeholder = `Enter ${param}...`
          inputField.dataset.param = param
          inputField.required = true
          inputField.addEventListener("input", validateInputs)

          paramGroup.appendChild(label)
          paramGroup.appendChild(inputField)
          paramContainer.appendChild(paramGroup)
        })

        const currentItem = settings.categories
          .flatMap((category) => category.items)
          .find((item) => item.path === apiPath)

        if (currentItem && currentItem.innerDesc) {
          const innerDescDiv = document.createElement("div")
          innerDescDiv.className = "text-muted mt-3"
          innerDescDiv.style.fontSize = "0.875rem"
          innerDescDiv.innerHTML = currentItem.innerDesc.replace(/\n/g, "<br>")
          paramContainer.appendChild(innerDescDiv)
        }

        // Add API status indicator in modal
        const statusDiv = document.createElement("div")
        statusDiv.className = "d-flex align-items-center mt-3 mb-2"

        const statusIndicator = document.createElement("span")
        statusIndicator.className = "status-indicator status-checking me-2"
        statusIndicator.style.width = "10px"
        statusIndicator.style.height = "10px"

        const statusText = document.createElement("span")
        statusText.className = "text-muted"
        statusText.style.fontSize = "0.875rem"
        statusText.textContent = "Checking API status..."

        statusDiv.appendChild(statusIndicator)
        statusDiv.appendChild(statusText)
        paramContainer.appendChild(statusDiv)

        modalRefs.queryInputContainer.appendChild(paramContainer)
        modalRefs.submitBtn.classList.remove("d-none")

        // Check API status when modal opens
        checkApiStatus(apiPath).then(({ status, message }) => {
          statusIndicator.className = `status-indicator me-2 ${status ? "status-online" : "status-offline"}`
          statusText.textContent = `API Status: ${message}`

          // Show toast with status
          showStatusToast(status, `${apiName}: ${message}`)

          // If API is offline, disable the submit button
          if (!status) {
            modalRefs.submitBtn.disabled = true
            modalRefs.submitBtn.title = "API is currently offline"
          }
        })

        modalRefs.submitBtn.onclick = async () => {
          const inputs = modalRefs.queryInputContainer.querySelectorAll("input")
          const newParams = new URLSearchParams()
          let isValid = true

          inputs.forEach((input) => {
            if (!input.value.trim()) {
              isValid = false
              input.classList.add("is-invalid")
            } else {
              input.classList.remove("is-invalid")
              newParams.append(input.dataset.param, input.value.trim())
            }
          })

          if (!isValid) {
            modalRefs.content.textContent = "Please fill in all required fields."
            modalRefs.responseContainer.classList.remove("d-none")
            return
          }

          const apiUrlWithParams = `${window.location.origin}${apiPath.split("?")[0]}?${newParams.toString()}`

          modalRefs.endpoint.textContent = apiUrlWithParams
          handleApiRequest(apiUrlWithParams, modalRefs, apiName)
        }
      } else {
        modalRefs.endpoint.textContent = baseApiUrl

        // For endpoints without parameters, automatically test them
        const statusDiv = document.createElement("div")
        statusDiv.className = "d-flex align-items-center mb-3"

        const statusIndicator = document.createElement("span")
        statusIndicator.className = "status-indicator status-checking me-2"
        statusIndicator.style.width = "10px"
        statusIndicator.style.height = "10px"

        const statusText = document.createElement("span")
        statusText.className = "text-muted"
        statusText.style.fontSize = "0.875rem"
        statusText.textContent = "Checking API status..."

        statusDiv.appendChild(statusIndicator)
        statusDiv.appendChild(statusText)
        modalRefs.queryInputContainer.appendChild(statusDiv)

        // Check API status and automatically fetch data if online
        checkApiStatus(apiPath).then(({ status, message }) => {
          statusIndicator.className = `status-indicator me-2 ${status ? "status-online" : "status-offline"}`
          statusText.textContent = `API Status: ${message}`

          // Show toast with status
          showStatusToast(status, `${apiName}: ${message}`)

          if (status) {
            // If API is online, automatically fetch data
            handleApiRequest(baseApiUrl, modalRefs, apiName)
          } else {
            // If API is offline, show message
            modalRefs.content.textContent = "This API endpoint is currently offline."
            modalRefs.responseContainer.classList.remove("d-none")
          }
        })
      }

      modal.show()
    })

    // Copy functionality
    document.getElementById("copyEndpoint").addEventListener("click", () => {
      const endpointText = document.getElementById("apiEndpoint").textContent
      copyToClipboard(endpointText, "Endpoint URL copied to clipboard!")
    })

    document.getElementById("copyResponse").addEventListener("click", () => {
      const responseText = document.getElementById("apiResponseContent").textContent
      copyToClipboard(responseText, "Response copied to clipboard!")
    })

    function copyToClipboard(text, successMessage) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          // Show toast or notification
          alert(successMessage)
        })
        .catch((err) => {
          console.error("Could not copy text: ", err)
        })
    }

    function validateInputs() {
      const submitBtn = document.getElementById("submitQueryBtn")
      const inputs = document.querySelectorAll(".param-container input")
      const isValid = Array.from(inputs).every((input) => input.value.trim() !== "")
      submitBtn.disabled = !isValid
    }

    async function handleApiRequest(apiUrl, modalRefs, apiName) {
      modalRefs.spinner.classList.remove("d-none")
      modalRefs.responseContainer.classList.add("d-none")

      try {
        // Create a controller for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout for actual requests

        const response = await fetch(apiUrl, {
          signal: controller.signal,
          headers: {
            Accept: "application/json, text/plain, image/*, */*",
          },
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const contentType = response.headers.get("Content-Type")
        if (contentType && contentType.startsWith("image/")) {
          const blob = await response.blob()
          const imageUrl = URL.createObjectURL(blob)

          const img = document.createElement("img")
          img.src = imageUrl
          img.alt = apiName
          img.style.maxWidth = "100%"
          img.style.height = "auto"
          img.style.borderRadius = "8px"

          modalRefs.content.innerHTML = ""
          modalRefs.content.appendChild(img)
        } else {
          try {
            const data = await response.json()
            modalRefs.content.textContent = JSON.stringify(data, null, 2)
          } catch (jsonError) {
            // If not JSON, try to get text
            const text = await response.text()
            modalRefs.content.textContent = text
          }
        }
      } catch (error) {
        if (error.name === "AbortError") {
          modalRefs.content.textContent = `Error: Request timed out after 15 seconds`
        } else {
          modalRefs.content.textContent = `Error: ${error.message}`
        }
      } finally {
        modalRefs.spinner.classList.add("d-none")
        modalRefs.responseContainer.classList.remove("d-none")
      }
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault()

        const targetId = this.getAttribute("href")
        const targetElement = document.querySelector(targetId)

        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: "smooth",
          })

          // Update active nav link
          document.querySelectorAll(".nav-link").forEach((link) => {
            link.classList.remove("active")
          })
          this.classList.add("active")
        }
      })
    })

    // Update active nav link on scroll
    window.addEventListener("scroll", () => {
      const scrollPosition = window.scrollY

      document.querySelectorAll("section").forEach((section) => {
        const sectionTop = section.offsetTop - 100
        const sectionBottom = sectionTop + section.offsetHeight
        const sectionId = section.getAttribute("id")

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          document.querySelectorAll(".nav-link").forEach((link) => {
            link.classList.remove("active")
            if (link.getAttribute("href") === `#${sectionId}`) {
              link.classList.add("active")
            }
          })
        }
      })
    })
  } catch (error) {
    console.error("Error loading settings:", error)
  } finally {
    // Simulate loading for better UX
    setTimeout(() => {
      loadingScreen.style.opacity = 0
      setTimeout(() => {
        loadingScreen.style.display = "none"
        body.classList.remove("no-scroll")
      }, 300)
    }, 1500)
  }
})
