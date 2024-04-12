const dotenv = require("dotenv")
dotenv.config()
const axios = require("axios")
const path = require("path")
const fs = require("fs").promises
const updateHistory = require("./updateHistory")

const secret = process.env.WOOSECRET
const key = process.env.WOOKEY
const authToken = Buffer.from(`${secret}:${key}`).toString("base64")
const siteUrl = process.env.SITEURL

exports.deleteProduct = async productId => {
  try {
    const response = await axios.delete(`${siteUrl}/wp-json/wc/v3/products/${productId}`, {
      headers: {
        Authorization: `Basic ${authToken}`
      }
    })

    console.log("Product deleted successfully")
  } catch (error) {
    console.error("Error deleting product:", error.response.data)
  }
}

exports.updateProduct = async (productId, title, content, innerId, cat, price, cross) => {
  try {
    let categories = []
    cat.forEach(item => {
      categories.push({ id: item })
    })
    const updatedProduct = {
      name: title,
      description: content,
      regular_price: price,
      meta_data: [
        { key: "inner_id_2", value: innerId },
        { key: "crosscode", value: cross }
      ],
      categories
    }

    const response = await axios.put(`${siteUrl}/wp-json/wc/v3/products/${productId}`, updatedProduct, {
      headers: {
        Authorization: `Basic ${authToken}`,
        "Content-Type": "application/json; charset=UTF-8"
      }
    })

    console.log("Product updated successfully", innerId)
  } catch (error) {
    console.error("Error updating product:", error.response.data)
  }
}

const writeJSONFile = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
    console.log("File updated successfully.")
  } catch (error) {
    console.error("Error writing JSON file:", error)
  }
}

exports.updateProductJSON = async (filePath, id, newData) => {
  const jsonData = await updateHistory.readFile(filePath)
  if (!jsonData) {
    return
  }

  const index = jsonData.findIndex(item => item.ID === id)
  if (index === -1) {
    console.error("Object with specified ID not found.")
    return
  }

  jsonData[index] = { ...jsonData[index], ...newData }

  await writeJSONFile(filePath, jsonData)
}

exports.removeProductJSON = async (filePath, id) => {
  try {
    // Read the JSON data from the file
    const jsonData = await fs.readFile(filePath, "utf8")
    const data = JSON.parse(jsonData)

    // Find the index of the object with the specific ID
    const indexToRemove = data.findIndex(item => item.ID === id)
    if (indexToRemove === -1) {
      console.error("Object with specified ID not found.")
      return
    }

    // Remove the object from the array
    data.splice(indexToRemove, 1)

    // Write the updated JSON data back to the file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
    console.log("Object removed successfully.")
  } catch (error) {
    console.error("Error removing object:", error)
  }
}
