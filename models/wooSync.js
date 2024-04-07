const dotenv = require("dotenv")
dotenv.config()
const axios = require("axios")
const path = require("path")
const fs = require("fs")

const username = process.env.WPAPIUSER
const key = process.env.WPAPIKEY
const authToken = Buffer.from(`${username}:${key}`).toString("base64")
const siteUrl = process.env.SITEURL

exports.downloadWooJson = async function () {
  try {
    // Make a GET request to your custom API endpoint
    const response = await axios.post(`${siteUrl}/wp-json/custom/v1/export-woocommerce-products`, {
      headers: {
        Authorization: `Basic ${authToken}`
      }
    })

    // Extract the URL from the response data
    const products = response.data.products
    const categories = response.data.categories

    // Download the file using the obtained URL
    await downloadFile(products, "woocommerce.json")
    await downloadFile(categories, "categories.json")
    console.log("File downloaded successfully")
  } catch (error) {
    // Handle any errors
    console.error("Error:", error)
  }
}

async function downloadFile(url, filename) {
  try {
    // Send GET request to download the file
    const response = await axios({
      method: "GET",
      url: url,
      responseType: "stream" // Set response type to stream for handling large files
    })

    // Write the downloaded file to the project root directory
    const fileName = filename // Specify the file name
    const directoryName = "uploads"
    const rootDir = process.cwd()
    const filePath = path.join(rootDir, directoryName, fileName) // Construct the file path
    const writer = fs.createWriteStream(filePath)
    response.data.pipe(writer)

    // Return a promise to track the completion of file download
    return new Promise((resolve, reject) => {
      writer.on("finish", resolve) // Resolve the promise when writing is complete
      writer.on("error", reject) // Reject the promise if there's an error
    })
  } catch (error) {
    throw new Error("Failed to download file: " + error.message)
  }
}
