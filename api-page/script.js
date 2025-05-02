document.addEventListener("DOMContentLoaded", async () => {
  const loadingScreen = document.getElementById("loadingScreen")
  const body = document.body
  body.classList.add("no-scroll")

  // Set current year in footer
  document.getElementById("currentYear").textContent = new Date().getFullYear()

  // Theme handling
  const themeToggle = document.getElementById("themeToggle")
  const htmlElement = document.documentElement

  // Check for saved theme preference or use preferred color scheme
  const savedTheme =
    localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")

  // Apply the theme
  applyTheme(savedTheme)

  // Theme toggle event listener
  themeToggle.addEventListener("click", () => {
    const currentTheme = htmlElement.getAttribute("data-theme")
    const newTheme = currentTheme === "dark" ? "light" : "dark"
    applyTheme(newTheme)
    localStorage.setItem("theme", newTheme)
  })

  function applyTheme(theme) {
    htmlElement.setAttribute("data-theme", theme)
    themeToggle.innerHTML = theme === "dark" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>'
  }

  try {
    const settings = await fetch("/src/settings.json").then((res) => res.json())

    const setContent = (id, property, value) => {
      const element = document.getElementById(id)
      if (element) element[property] = value
    }

    // Set footer logo
    setContent("footerLogo", "textContent", settings.name || "Hookrest API")

    const randomImageSrc =
      Array.isArray(settings.header.imageSrc) && settings.header.imageSrc.length > 0
        ? settings.header.imageSrc[Math.floor(Math.random() * settings.header.imageSrc.length)]
        : ""

    // Set header background
    const headerBg = document.getElementById("headerBg")
    if (headerBg && randomImageSrc) {
      headerBg.style.backgroundImage = `url(${randomImageSrc})`
    }

    setContent("page", "textContent", settings.name || "Hookrest API")
    setContent("header", "textContent", settings.name || "Hookrest API")
    setContent("name", "textContent", settings.name || "Hookrest API")
    setContent("version", "textContent", settings.version || "v1.0 Beta")
    setContent("versionHeader", "textContent", settings.header.status || "Online!")
    setContent("description", "textContent", settings.description || "Simple API's")

    const apiLinksContainer = document.getElementById("apiLinks")
    if (apiLinksContainer && settings.links?.length) {
      settings.links.forEach(({ url, name }) => {
        const link = Object.assign(document.createElement("a"), {
          href: url,
          target: "_blank",
          className: "btn btn-outline-primary",
        })

        // Add icon based on link name
        let icon = "fas fa-link"
        if (name.toLowerCase().includes("source") || name.toLowerCase().includes("code")) {
          icon = "fas fa-code"
        } else if (name.toLowerCase().includes("contact") || name.toLowerCase().includes("me")) {
          icon = "fas fa-envelope"
        }

        const iconElement = document.createElement("i")
        iconElement.className = `${icon} me-2`
        link.appendChild(iconElement)

        const textNode = document.createTextNode(name)
        link.appendChild(textNode)

        apiLinksContainer.appendChild(link)
      })
    }

    const apiContent = document.getElementById("apiContent")
    settings.categories.forEach((category) => {
      const sortedItems = category.items.sort((a, b) => a.name.localeCompare(b.name))

      // Create category header
      const categoryHeader = document.createElement("h3")
      categoryHeader.className = "category-header mb-4"
      categoryHeader.style.fontSize = "22px"
      categoryHeader.textContent = category.name

      // Create category icon based on name
      let categoryIcon = "fas fa-layer-group"
      if (category.name.toLowerCase().includes("ai")) {
        categoryIcon = "fas fa-robot"
      } else if (category.name.toLowerCase().includes("download") || category.name.toLowerCase().includes("dl")) {
        categoryIcon = "fas fa-download"
      } else if (category.name.toLowerCase().includes("search")) {
        categoryIcon = "fas fa-search"
      } else if (category.name.toLowerCase().includes("islami")) {
        categoryIcon = "fas fa-mosque"
      } else if (category.name.toLowerCase().includes("fun")) {
        categoryIcon = "fas fa-gamepad"
      } else if (category.name.toLowerCase().includes("random")) {
        categoryIcon = "fas fa-random"
      } else if (category.name.toLowerCase().includes("maker")) {
        categoryIcon = "fas fa-magic"
      } else if (category.name.toLowerCase().includes("tools")) {
        categoryIcon = "fas fa-tools"
      } else if (category.name.toLowerCase().includes("info")) {
        categoryIcon = "fas fa-info-circle"
      } else if (category.name.toLowerCase().includes("apk")) {
        categoryIcon = "fas fa-mobile-alt"
      }

      const iconElement = document.createElement("i")
      iconElement.className = `${categoryIcon} me-2`
      categoryHeader.prepend(iconElement)

      apiContent.appendChild(categoryHeader)

      // Create row for cards
      const row = document.createElement("div")
      row.className = "row"

      // Create cards for each API
      sortedItems.forEach((item) => {
        const col = document.createElement("div")
        col.className = "col-md-6 col-lg-4 api-item mb-4"
        col.setAttribute("data-name", item.name)
        col.setAttribute("data-desc", item.desc)

        // Determine method type from path
        const methodType = "GET"
        const methodClass = "info"

        const card = document.createElement("div")
        card.className = "api-card h-100"

        // Card header
        const cardHeader = document.createElement("div")
        cardHeader.className = "api-card-header"

        const cardTitle = document.createElement("h5")
        cardTitle.className = "api-card-title"
        cardTitle.textContent = item.name

        const cardDesc = document.createElement("p")
        cardDesc.className = "api-card-desc mb-0"
        cardDesc.textContent = item.desc

        cardHeader.appendChild(cardTitle)
        cardHeader.appendChild(cardDesc)

        // Card footer
        const cardFooter = document.createElement("div")
        cardFooter.className = "api-card-footer"

        const methodBadge = document.createElement("span")
        methodBadge.className = `method-badge bg-${methodClass}`
        methodBadge.textContent = methodType

        const getButton = document.createElement("button")
        getButton.className = "btn btn-primary get-api-btn"
        getButton.textContent = "Try It"
        getButton.setAttribute("data-api-path", item.path)
        getButton.setAttribute("data-api-name", item.name)
        getButton.setAttribute("data-api-desc", item.desc)

        cardFooter.appendChild(methodBadge)
        cardFooter.appendChild(getButton)

        // Assemble card
        card.appendChild(cardHeader)
        card.appendChild(cardFooter)

        col.appendChild(card)
        row.appendChild(col)
      })

      apiContent.appendChild(row)
    })

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
        const nextElement = header.nextElementSibling
        if (nextElement && nextElement.classList.contains("row")) {
          const visibleItems = nextElement.querySelectorAll('.api-item:not([style*="display: none"])')
          header.style.display = visibleItems.length ? "" : "none"
          nextElement.style.display = visibleItems.length ? "" : "none"
        }
      })
    })

    let bootstrap // Declare bootstrap here
    document.addEventListener("click", (event) => {
      if (!event.target.classList.contains("get-api-btn")) return

      const { apiPath, apiName, apiDesc } = event.target.dataset
      const modal = new bootstrap.Modal(document.getElementById("apiResponseModal"))
      const modalRefs = {
        label: document.getElementById("apiResponseModalLabel"),
        desc: document.getElementById("apiResponseModalDesc"),
        content: document.getElementById("apiResponseContent"),
        endpoint: document.getElementById("apiEndpoint"),
        spinner: document.getElementById("apiResponseLoading"),
        queryInputContainer: document.getElementById("apiQueryInputContainer"),
        submitBtn: document.getElementById("submitQueryBtn"),
      }

      modalRefs.label.textContent = apiName
      modalRefs.desc.textContent = apiDesc
      modalRefs.content.textContent = ""
      modalRefs.endpoint.textContent = ""
      modalRefs.spinner.classList.add("d-none")
      modalRefs.content.classList.add("d-none")
      modalRefs.endpoint.classList.add("d-none")

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
          paramGroup.className = "param-group"

          const paramLabel = document.createElement("label")
          paramLabel.className = "param-label"
          paramLabel.textContent = `${param.charAt(0).toUpperCase() + param.slice(1)}`

          const inputField = document.createElement("input")
          inputField.type = "text"
          inputField.className = "form-control"
          inputField.placeholder = `Enter ${param}...`
          inputField.dataset.param = param

          inputField.required = true
          inputField.addEventListener("input", validateInputs)

          paramGroup.appendChild(paramLabel)
          paramGroup.appendChild(inputField)
          paramContainer.appendChild(paramGroup)
        })

        const currentItem = settings.categories
          .flatMap((category) => category.items)
          .find((item) => item.path === apiPath)

        if (currentItem && currentItem.innerDesc) {
          const innerDescDiv = document.createElement("div")
          innerDescDiv.className = "text-muted mt-3"
          innerDescDiv.style.fontSize = "13px"
          innerDescDiv.innerHTML = currentItem.innerDesc.replace(/\n/g, "<br>")
          paramContainer.appendChild(innerDescDiv)
        }

        modalRefs.queryInputContainer.appendChild(paramContainer)
        modalRefs.submitBtn.classList.remove("d-none")

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
            modalRefs.content.classList.remove("d-none")
            return
          }

          const apiUrlWithParams = `${window.location.origin}${apiPath.split("?")[0]}?${newParams.toString()}`

          modalRefs.queryInputContainer.innerHTML = ""
          modalRefs.submitBtn.classList.add("d-none")
          handleApiRequest(apiUrlWithParams, modalRefs, apiName)
        }
      } else {
        handleApiRequest(baseApiUrl, modalRefs, apiName)
      }

      modal.show()
    })

    function validateInputs() {
      const submitBtn = document.getElementById("submitQueryBtn")
      const inputs = document.querySelectorAll(".param-container input")
      const isValid = Array.from(inputs).every((input) => input.value.trim() !== "")
      submitBtn.disabled = !isValid
    }

    async function handleApiRequest(apiUrl, modalRefs, apiName) {
      modalRefs.spinner.classList.remove("d-none")
      modalRefs.content.classList.add("d-none")

      try {
        const response = await fetch(apiUrl)

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
          const data = await response.json()
          modalRefs.content.textContent = JSON.stringify(data, null, 2)
        }

        modalRefs.endpoint.textContent = apiUrl
        modalRefs.endpoint.classList.remove("d-none")
      } catch (error) {
        modalRefs.content.textContent = `Error: ${error.message}`
      } finally {
        modalRefs.spinner.classList.add("d-none")
        modalRefs.content.classList.remove("d-none")
      }
    }
  } catch (error) {
    console.error("Error loading settings:", error)
  } finally {
    setTimeout(() => {
      loadingScreen.style.display = "none"
      body.classList.remove("no-scroll")
    }, 2000)
  }
})

window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar")
  const navbarBrand = document.querySelector(".navbar-brand")
  if (window.scrollY > 0) {
    navbarBrand.classList.add("visible")
    navbar.classList.add("scrolled")
  } else {
    navbarBrand.classList.remove("visible")
    navbar.classList.remove("scrolled")
  }
})

// Initialize bootstrap components
document.addEventListener("DOMContentLoaded", () => {
  window.bootstrap = bootstrap
  bootstrap = window.bootstrap
})
