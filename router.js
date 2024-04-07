const express = require("express")
const router = express.Router()
const mainController = require("./controllers/mainController")

router.get("/", mainController.home)

router.post("/woo-sync", mainController.wooSync())

router.post("/upload-price", mainController.upload())

module.exports = router
