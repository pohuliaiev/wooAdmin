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

//editor

const editButtons = document.querySelectorAll(".edit-content")

editButtons.forEach(button => {
  button.addEventListener("click", function () {
    const productId = button.getAttribute("data-id")
    const contentDiv = document.querySelector(`.show-content[data-id="${productId}"]`)
    const content = contentDiv.innerHTML

    // Replace the content div with a textarea
    const textarea = document.createElement("textarea")
    textarea.value = content
    textarea.setAttribute("id", `editor-content-${productId}`) // Add data-id attribute
    contentDiv.parentNode.replaceChild(textarea, contentDiv)

    // Initialize TinyMCE on the textarea
    tinymce.init({
      selector: "textarea",
      plugins: "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed linkchecker a11ychecker tinymcespellchecker permanentpen powerpaste advtable advcode editimage advtemplate ai mentions tinycomments tableofcontents footnotes mergetags autocorrect typography inlinecss markdown",
      toolbar: "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
      tinycomments_mode: "embedded",
      tinycomments_author: "Author name",
      mergetags_list: [
        { value: "First.Name", title: "First Name" },
        { value: "Email", title: "Email" }
      ],
      ai_request: (request, respondWith) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant"))
    })

    // Change button class to 'save-content'
    button.classList.remove("edit-content")
    button.classList.add("save-content")

    // Change button text to 'Сохранить'
    button.textContent = "Сохранить"

    // Attach event listener for save button
    button.addEventListener("click", function () {
      // Get the updated content from TinyMCE
      const updatedContent = tinymce.get(`editor-content-${productId}`).getContent()

      // Perform any action needed to save the updated content
      const contentDiv = document.createElement("div")
      contentDiv.classList.add("show-content")
      contentDiv.setAttribute("data-id", `${productId}`)
      contentDiv.innerHTML = updatedContent
      // Replace TinyMCE instance with the original textarea
      const originalTextarea = tinymce.get(`editor-content-${productId}`).getBody()
      const parent = originalTextarea.parentNode
      parent.replaceChild(textarea, contentDiv)
      tinymce.remove(`editor-content-${productId}`)

      // Change button class back to 'edit-content'
      button.classList.remove("save-content")
      button.classList.add("edit-content")

      // Change button text back to 'Редактировать'
      button.textContent = "Редактировать"
    })
  })
})
