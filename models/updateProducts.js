const dotenv = require("dotenv")
dotenv.config()
const axios = require("axios")
const path = require("path")
const fs = require("fs")

const secret = process.env.WOOSECRET
const key = process.env.WOOKEY
const authToken = Buffer.from(`${secret}:${key}`).toString("base64")
const siteUrl = process.env.SITEURL

exports.updateProduct = async (productId, title, content, innerId, cat) => {
  try {
    let categories = []
    cat.forEach(item => {
      categories.push({ id: item })
    })
    const updatedProduct = {
      name: title,
      description: content,
      meta_data: [{ key: "inner_id_2", value: innerId }],
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
