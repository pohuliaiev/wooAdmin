const dotenv = require("dotenv")
dotenv.config()
const fs = require("fs").promises
const path = require("path")
const wooSync = require("../models/wooSync")
const updateHistory = require("../models/updateHistory")
const uploadPrice = require("../models/uploadPrice")
const updateProducts = require("../models/updateProducts")
const Order = require("../models/order")
const orderCollection = require("../db").db().collection("orders")

const chatId = process.env.CHATID

const TelegramBot = require("node-telegram-bot-api")
const tgToken = process.env.TGTOKEN
const bot = new TelegramBot(tgToken, { polling: false })

exports.home = async function (req, res) {
  if (req.session.isAuthenticated) {
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
  } else {
    res.render("login")
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
  if (req.session.isAuthenticated) {
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
  } else {
    res.render("login")
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

exports.productUpdate = function () {
  return async function (req, res) {
    try {
      const id = req.body.productId
      const categories = req.body.categories
      const name = req.body.productTitle
      const innerId = req.body.innerId
      const content = req.body.content
      const price = req.body.price
      const cross = req.body.crossCode
      const updatedData = { post_title: name, inner_id_2: innerId, content: content, category_ids: categories.join(","), price: price, crossCode: cross }
      await updateProducts.updateProduct(id, name, content, innerId, categories, price, cross)
      await updateProducts.updateProductJSON("./uploads/woocommerce.json", id, updatedData)
      res.json({
        success: true
      })
    } catch (error) {
      console.error("Error updating data:", error)
      res.status(500).json({ success: false, error: "Internal Server Error" })
    }
  }
}

exports.productDelete = function () {
  return async function (req, res) {
    try {
      const id = req.body.id
      await updateProducts.deleteProduct(id)
      await updateProducts.removeProductJSON("./uploads/woocommerce.json", id)
      res.json({
        success: true
      })
    } catch (error) {
      console.error("Error updating data:", error)
      res.status(500).json({ success: false, error: "Internal Server Error" })
    }
  }
}

exports.getOrders = async (req, res) => {
  const order = new Order()
  order.type = "Корзина"
  try {
    const orderSent = order.wooCart(req).order
    const message = order.wooCart(req).message
    await orderCollection.insertOne(orderSent)

    await bot.sendMessage(chatId, message)
    res.status(200).json(orderSent)
  } catch (e) {
    console.log(e)
  }
}

exports.getForm = async (req, res) => {
  const order = new Order()
  order.type = req.body.type
  try {
    const orderSent = order.contactForm(req)
    const message = orderSent.message
    const data = orderSent.contactData
    await orderCollection.insertOne(data)
    await bot.sendMessage(chatId, message)
  } catch (e) {
    console.log(e)
  }
}

exports.displayOrders = async (req, res) => {
  if (req.session.isAuthenticated) {
    try {
      const orders = await orderCollection.find().toArray()
      orders.sort((a, b) => {
        const parseDate = dateString => {
          const [datePart, timePart] = dateString.split(" ")
          const [day, month, year] = datePart.split(".").map(Number)
          const [hours, minutes] = timePart.split(":").map(Number)
          return new Date(year, month - 1, day, hours, minutes)
        }

        const dateA = parseDate(a.date)
        const dateB = parseDate(b.date)
        return dateB - dateA
      })
      res.render("clients", { orders })
    } catch (e) {
      console.log(e)
    }
  } else {
    res.render("login")
  }
}
