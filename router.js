const express = require("express")
const router = express.Router()
const path = require("path")
const mainController = require("./controllers/mainController")

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

module.exports = router
