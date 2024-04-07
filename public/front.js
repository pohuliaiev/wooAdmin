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

document.getElementById("upload_price").addEventListener("click", () => {
  // Simulate click on the file input
  document.getElementById("fileInput").click()
})

document.getElementById("fileInput").addEventListener("change", () => {
  const fileInput = document.getElementById("fileInput")
  const file = fileInput.files[0]

  // Validate file format
  if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    alert("Please select a valid XLSX file.")
    return
  }

  // Send file to backend for processing
  const formData = new FormData()
  formData.append("file", file)

  axios
    .post("/upload-price", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
    .then(response => {
      document.getElementById("items_quantity").innerHTML = response.data.arrayLength
      document.getElementById("success").classList.remove("d-none")
      document.getElementById("price_date").innerHTML = response.data.date
    })
    .catch(error => {
      document.getElementById("error").remove("d-none")
      console.error("Error uploading file:", error)
    })
})

const wooSync = document.getElementById("woo_sync")

if (wooSync) {
  wooSync.onclick = function () {
    wooSyncFunc()
  }
}

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

document.addEventListener("DOMContentLoaded", function () {
  // Get all elements with the class 'new-product'
  const newProducts = document.querySelectorAll(".new-product")

  // Loop through each new product
  newProducts.forEach(product => {
    // Get the product ID from the 'id' attribute of the <tr> element
    const productId = product.id

    // Get the product name element
    const productNameElement = product.querySelector(".product-name")

    // Get the product title input element
    const productTitleInput = document.getElementById(`productTitle-${productId}`)

    // Set the value of the product title input to the product name
    if (productNameElement && productTitleInput) {
      productTitleInput.value = productNameElement.textContent
    }
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

    selectedModels.forEach(model => {
      // Check if an element with the same data-id already exists in the container
      const existingElement = categories.querySelector(`[data-id="${model.id}"]`)

      // If an element with the same data-id doesn't exist, add a new one
      if (!existingElement) {
        // Create a new div element
        const span = document.createElement("span")
        span.classList.add("badge", "text-bg-warning", "mb-10")
        // Set the text content of the div
        span.innerHTML = `${model.name} <button type="button" class="btn-close" aria-label="Close"></button>`

        // Set the data-id attribute of the div
        span.setAttribute("data-id", model.id)

        // Append the div to the container
        categories.appendChild(span)
      }
    })
  })
})
