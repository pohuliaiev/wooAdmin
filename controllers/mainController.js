const dotenv = require("dotenv")
dotenv.config()
const wooSync = require("../models/wooSync")
const updateHistory = require("../models/updateHistory")
const uploadPrice = require("../models/uploadPrice")

exports.home = async function (req, res) {
  try {
    const updateData = await updateHistory.readFile("./uploads/updateHistory.json")
    const uploadedPrice = await updateHistory.readFile("./uploads/pricelist.json")
    const wooProducts = await updateHistory.readFile("./uploads/woocommerce.json")
    const compare = await uploadPrice.priceCompare(uploadedPrice, wooProducts)
    const exist = await uploadPrice.productsNotExistInSite(uploadedPrice, wooProducts)
    const { sync_update, price_upload } = updateData
    res.render("main", { sync_update, price_upload, compare, exist })
  } catch (error) {
    console.error("Error fetching data:", error)
    res.status(500).send("Internal Server Error")
  }
}

exports.wooSync = function () {
  return async function (req, res) {
    try {
      const date = updateHistory.currentDate
      await wooSync.downloadWooJson()
      await updateHistory.updateHistory({
        sync_update: date
      })
      res.json({
        success: true,
        date
      })
    } catch (error) {
      console.error("Error updating data:", error)
      res.status(500).json({ success: false, error: "Internal Server Error" })
    }
  }
}

exports.upload = function () {
  return async function (req, res) {
    try {
      const file = req.files.file
      const price = await uploadPrice.uploadExel(file)
      const date = updateHistory.currentDate
      const arrayLength = price.arrayLength
      await updateHistory.updateHistory({
        price_upload: date
      })
      res.json({
        success: true,
        date,
        arrayLength
      })
    } catch (error) {
      console.error("Error updating data:", error)
      res.status(500).json({ success: false, error: "Internal Server Error" })
    }
  }
}
