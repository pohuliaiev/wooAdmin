const fs = require("fs").promises
const path = require("path")
const moment = require("moment-timezone")

exports.updateHistory = async function (newData) {
  try {
    const rootDir = process.cwd()
    const filePath = path.join(rootDir, "uploads", "updateHistory.json")

    // Check if the file exists
    let data
    try {
      await fs.access(filePath)
      // File exists, read its content
      data = await fs.readFile(filePath, "utf8")
    } catch (error) {
      // File doesn't exist, create a new one with initial data
      data = JSON.stringify(newData, null, 2)
    }

    // Parse the JSON data
    let jsonData = JSON.parse(data)

    // Update the data or add new data
    Object.assign(jsonData, newData)

    // Write the updated data back to the file
    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), "utf8")
    console.log("Data has been updated successfully.")
  } catch (error) {
    console.error("Error:", error)
  }
}

exports.currentDate = moment().tz("Europe/Berlin").add(1, "hours").format("DD.MM.YYYY HH:mm:ss")

exports.readFile = async function (filePath) {
  try {
    // Read the content of the JSON file
    const fileContent = await fs.readFile(filePath, "utf8")

    // Parse the JSON data
    const jsonData = JSON.parse(fileContent)

    return jsonData
  } catch (error) {
    console.error("Error reading JSON file:", error)
    throw error // Rethrow the error to handle it in the calling code
  }
}

exports.readJsonFile = function (filePath) {
  return new Promise((resolve, reject) => {
    // Read the JSON file
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err) // Reject the promise if there's an error reading the file
        return
      }

      try {
        // Parse the JSON data
        const jsonData = JSON.parse(data)
        resolve(jsonData) // Resolve the promise with the parsed JSON data
      } catch (error) {
        reject(error) // Reject the promise if there's an error parsing the JSON data
      }
    })
  })
}
