const express = require("express")
const router = express.Router()
const path = require("path")
const mainController = require("./controllers/mainController")

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.authenticated) {
    // User is authenticated, proceed to the next middleware
    return next()
  } else {
    // User is not authenticated, redirect to login page or display an error
    res.status(401).send("Unauthorized")
  }
}

router.get("/", mainController.home)

router.get("/products-list", mainController.editor)

router.get("/uploads/categories.json", (req, res) => {
  const filePath = path.join(__dirname, "uploads", "categories.json")
  res.sendFile(filePath)
})

router.post("/woo-sync", mainController.wooSync())

router.post("/upload-price", mainController.upload())

router.post("/search", mainController.search())

router.post("/update-product", mainController.productUpdate())

router.post("/delete-product", mainController.productDelete())

router.post("/get-order", mainController.getOrders)

router.post("/login", (req, res) => {
  const { password } = req.body

  // Check if the password is correct
  if (password === process.env.PSWD) {
    req.session.isAuthenticated = true
    res.json({ success: true })
  } else {
    res.json({ success: false, error: "Password invalid" })
  }
})

module.exports = router
