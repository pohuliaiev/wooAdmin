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
