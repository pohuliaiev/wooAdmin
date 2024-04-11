const loader = document.getElementById("preloader")
const fadeOverlay = document.getElementById("fadeOverlay")

function wooSyncFunc() {
  loader.classList.remove("d-none")
  fadeOverlay.style.display = "block"
  axios
    .post("/woo-sync")
    .then(response => {
      const data = response.data
      loader.classList.add("d-none")
      fadeOverlay.style.display = "none"
      // Handle the data received from the server

      if (data.success) {
        document.getElementById("sync_date").innerHTML = data.date
      } else {
        loader.classList.add("d-none")
        fadeOverlay.style.display = "none"
        // myModal.show()
        console.error("Server error:", data.error)
      }
    })
    .catch(error => {
      loader.classList.add("d-none")
      fadeOverlay.style.display = "none"
      // myModal.show()
      console.error("Axios error:", error)
    })
}

const wooSync = document.getElementById("woo_sync")

if (wooSync) {
  wooSync.onclick = function () {
    wooSyncFunc()
  }
}
const form = document.querySelector("form")
const input = document.querySelector('input[type="search"]')

form.addEventListener("submit", function (event) {
  event.preventDefault() // Prevent the default form submission behavior

  const searchTerm = input.value.trim() // Get the search term from the input field

  axios
    .post("/search", {
      params: {
        term: searchTerm
      }
    })
    .then(response => {
      const data = response.data.searchedItem
      input.value = ""
      const table = document.getElementById("products-table")
      table.innerHTML = ""
      data.forEach(item => {
        // Create a table row element
        const row = document.createElement("tr")

        // Set the inner HTML of the table row
        row.innerHTML = `
          <td>${item.inner_id}</td>
          <td>${item.post_title}</td>
          <td>${item.price}</td>
          <td>
            ${item.categories.map(category => `<div class="badge text-bg-warning mb-10" style="margin-left: 5px;">${category}</div>`).join(" ")}
          </td>
        `

        // Append the table row to the table
        table.appendChild(row)
      })
    })
    .catch(error => {
      // Handle errors
      console.error("Error:", error)
    })
})

document.addEventListener("click", function (event) {
  // Check if the clicked element is a close button with the class "btn-close"
  if (event.target.classList.contains("btn-close")) {
    // Get the parent badge element and remove it when the close button is clicked
    const badge = event.target.parentElement
    badge.remove()
  }
})

axios
  .get("uploads/categories.json")
  .then(response => {
    const jsonData = response.data

    const autoBrandSelects = document.querySelectorAll(".auto-brand-select")

    autoBrandSelects.forEach(select => {
      const itemId = select.id.split("-")[1] // Extract itemId from select ID

      jsonData.forEach(item => {
        const option = document.createElement("option")
        option.value = item.id
        option.textContent = item.name
        select.appendChild(option)
      })

      // Event listener for auto brand select dropdowns
      select.addEventListener("change", function () {
        const selectedBrandId = this.value
        const itemId = this.id.split("-")[1] // Extract itemId from select ID
        const autoModelsSelect = document.getElementById(`autoModels-${itemId}`)

        // Clear previous options
        autoModelsSelect.innerHTML = ""

        // Enable the auto models select
        autoModelsSelect.disabled = false

        // Find selected brand data
        const selectedBrand = jsonData.find(item => item.id === selectedBrandId)

        // Populate auto models select dropdown
        selectedBrand.children.forEach(model => {
          const option = document.createElement("option")
          option.value = model.id
          option.textContent = model.name
          autoModelsSelect.appendChild(option)
        })
      })
    })
  })
  .catch(error => {
    console.error("Error fetching JSON data:", error)
  })

const addCategoryButtons = document.querySelectorAll(".add-category")

addCategoryButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    // Retrieve the dynamic ID from the button's ID attribute
    const itemId = this.id.split("-")[1]

    const selectElement = document.getElementById(`autoModels-${itemId}`)

    const selectedModelsArr = Array.from(selectElement.selectedOptions)
    let selectedModels = []
    selectedModelsArr.forEach(item => {
      selectedModels.push({ id: item.value, name: item.textContent })
    })

    const categories = document.getElementById(`categories-${itemId}`)

    const selectBrands = document.querySelector(`[data-id="${itemId}"]`)
    const selectedBrandOption = selectBrands.options[selectBrands.selectedIndex]
    const brand = selectedBrandOption.textContent

    selectedModels.forEach(model => {
      // Check if an element with the same data-id already exists in the container
      const existingElement = categories.querySelector(`[data-id="${model.id}"]`)

      // If an element with the same data-id doesn't exist, add a new one
      if (!existingElement) {
        // Create a new div element
        const span = document.createElement("span")
        span.classList.add("badge", "text-bg-warning", "mb-10")
        // Set the text content of the div
        span.innerHTML = `${brand}: ${model.name} <button type="button" class="btn-close" aria-label="Close"></button>`

        // Set the data-id attribute of the div
        span.setAttribute("data-id", model.id)

        // Append the div to the container
        categories.appendChild(span)
      }
    })
  })
})

//editor

const editButtons = document.querySelectorAll(".edit-content")

editButtons.forEach(button => {
  button.addEventListener("click", function handleClick() {
    const productId = button.getAttribute("data-id")
    const contentDiv = document.querySelector(`.show-content[data-id="${productId}"]`)
    if (contentDiv) {
      const content = contentDiv.innerHTML
      const textarea = document.createElement("textarea")
      textarea.value = content
      textarea.setAttribute("id", `editor-content-${productId}`) // Add data-id attribute

      // Save a reference to the original div before replacing it
      const parent = contentDiv.parentNode
      const nextSibling = contentDiv.nextSibling

      // Replace the content div with the textarea
      parent.replaceChild(textarea, contentDiv)

      tinymce.init({
        selector: `textarea#editor-content-${productId}`
        // TinyMCE initialization options...
      })

      // Change button class to 'save-content'
      button.classList.remove("edit-content")
      button.classList.add("save-content")

      // Change button text to 'Сохранить'
      button.textContent = "Сохранить"

      // Attach event listener for save button
      button.removeEventListener("click", handleClick) // Remove the event listener
      button.addEventListener("click", function () {
        const productId = button.getAttribute("data-id")
        const updatedContent = tinymce.get(`editor-content-${productId}`).getContent()
        tinymce.get(`editor-content-${productId}`).hide()

        // Find the textarea element
        const textarea = document.getElementById(`editor-content-${productId}`)
        if (!textarea || textarea.parentElement !== parent) {
          // If textarea doesn't exist or is not a direct child of parent, exit the function
          return
        }

        // Restore the original div
        const originalDiv = document.createElement("div")
        originalDiv.classList.add("show-content")
        originalDiv.setAttribute("data-id", productId)
        originalDiv.innerHTML = updatedContent

        // Insert the original div back into the DOM before the textarea
        parent.insertBefore(originalDiv, textarea)

        // Remove the textarea
        parent.removeChild(textarea)

        // Change button class back to 'edit-content'
        button.classList.remove("save-content")
        button.classList.add("edit-content")

        // Change button text back to 'Редактировать'
        button.textContent = "Редактировать"

        // Destroy the existing instance of TinyMCE
        const editor = tinymce.get(`editor-content-${productId}`)
        if (editor) {
          editor.remove()
        }

        // Reattach the event listener for edit button
        button.removeEventListener("click", handleClick)
        button.addEventListener("click", handleClick)
      })
    }
  })
})

const updateButtons = document.querySelectorAll(".update-product")
updateButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    loader.classList.remove("d-none")
    fadeOverlay.style.display = "block"
    const productId = this.getAttribute("data-id")
    const categoryDiv = document.getElementById(`categories-${productId}`)
    const spans = categoryDiv.querySelectorAll("span[data-id]")
    const categories = Array.from(spans).map(span => span.dataset.id) //array of categories
    const productTitle = document.getElementById(`productTitle-${productId}`).value //product name
    const innerId = document.getElementById(`productCode-${productId}`).value //inner id
    const contentDiv = document.querySelector(`.show-content[data-id="${productId}"]`)
    const content = contentDiv.innerHTML

    const data = {
      productId,
      categories,
      productTitle,
      innerId,
      content
    }

    axios
      .post("/update-product", data)
      .then(response => {
        loader.classList.add("d-none")
        fadeOverlay.style.display = "none"
        console.log("product updated", innerId)
      })
      .catch(error => {
        loader.classList.add("d-none")
        fadeOverlay.style.display = "none"
        console.error("Error updating product:", error)
      })
  })
})

const testBtn = document.getElementById("test-btn")
testBtn.addEventListener("click", function () {
  const productId = this.getAttribute("data-id")
  const categoryDiv = document.getElementById(`categories-${productId}`)
  const spans = categoryDiv.querySelectorAll("span[data-id]")
  const categories = Array.from(spans).map(span => span.dataset.id)
  const catNames = Array.from(spans).map(span => span.textContent)
  const catListDiv = document.getElementById(`catlist-${productId}`)
  catNames.forEach(item => {
    const div = document.createElement("div")
    div.classList.add("badge", "text-bg-warning", "mb-10")
    div.style.marginLeft = "5px"
    div.textContent = item
    catListDiv.appendChild(div)
  })
})
