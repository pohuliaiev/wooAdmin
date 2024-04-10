const dotenv = require("dotenv")
dotenv.config()
const fs = require("fs").promises
const path = require("path")
const wooSync = require("../models/wooSync")
const updateHistory = require("../models/updateHistory")
const uploadPrice = require("../models/uploadPrice")

exports.home = async function (req, res) {
  try {
    const updateData = await updateHistory.readFile("./uploads/updateHistory.json")
    const uploadedPrice = await updateHistory.readFile("./uploads/pricelist.json")
    let wooProducts

    try {
      // Attempt to read the woocommerce.json file
      wooProducts = await updateHistory.readFile("./uploads/woocommerce.json")
    } catch (error) {
      // If the file does not exist, download it
      console.error("File woocommerce.json does not exist. Downloading...")
      const date = updateHistory.currentDate
      await wooSync.downloadWooJson()
      await updateHistory.updateHistory({ sync_update: date })

      // After downloading, attempt to read the file again
      wooProducts = await updateHistory.readFile("./uploads/woocommerce.json")
    }
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

exports.editor = async function (req, res) {
  try {
    const updateData = await updateHistory.readFile("./uploads/updateHistory.json")

    const wooProducts = await updateHistory.readFile("./uploads/woocommerce.json")

    const categories = await updateHistory.readFile("./uploads/categories.json")

    const pageSize = 50

    const page = parseInt(req.query.page) || 1

    const startIndex = (page - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize, wooProducts.length)

    const products = wooProducts.slice(startIndex, endIndex)

    const totalPages = Math.ceil(wooProducts.length / pageSize)

    const currentPage = page

    const { sync_update, price_upload } = updateData
    res.render("list", { sync_update, price_upload, products, page, totalPages, currentPage, categories })
  } catch (error) {
    console.error("Error fetching data:", error)
    res.status(500).send("Internal Server Error")
  }
}

exports.search = function () {
  return async function (req, res) {
    try {
      const products = await updateHistory.readFile("./uploads/woocommerce.json")
      const categories = await updateHistory.readFile("./uploads/categories.json")

      const searchTerm = req.body.params.term.toLowerCase()
      const searchedItem = products.filter(item => item.inner_id.toLowerCase().includes(searchTerm))

      // Iterate through each searched item and add category information
      searchedItem.forEach(item => {
        const productCats = item.category_ids.split(",").map(Number)
        const matchedCategories = []

        categories.forEach(category => {
          category.children.forEach(child => {
            if (productCats.includes(parseInt(child.id))) {
              matchedCategories.push(`${category.name} ${child.name}`)
            }
          })
        })

        item.categories = matchedCategories
      })

      res.json({
        success: true,
        searchedItem
      })
    } catch (error) {
      console.error("Error updating data:", error)
      res.status(500).json({ success: false, error: "Internal Server Error" })
    }
  }
}
