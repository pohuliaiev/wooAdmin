document.getElementById("loginForm").addEventListener("submit", function (event) {
  event.preventDefault()

  const formData = new FormData(this)
  const url = "/login"

  axios
    .post(url, formData)
    .then(response => {
      // Handle the Axios response
      const data = response.data
      const alert = document.getElementById("alert")

      if (data.success) {
        console.log(data) // Log success message
        alert.innerHTML = `
       <div class="alert alert-success alert-dismissible fade show" role="alert">
  Авторизация успешна! Пернаправление....
  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
</div>
       `
        window.location.replace("/")
      } else {
        // Log error message
        alert.innerHTML = `
       <div class="alert alert-danger alert-dismissible fade show" role="alert">
  Введён неправильный пароль
  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
</div>
       `
      }
    })
    .catch(error => {
      console.error("Axios error:", error)
    })
})
