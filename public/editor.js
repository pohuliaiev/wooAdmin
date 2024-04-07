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
        <td></td>
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
