const xlsx = require("xlsx")
const fs = require("fs")

exports.uploadExel = function (file) {
  return new Promise((resolve, reject) => {
    // Parse XLSX file
    const workbook = xlsx.read(file.data, { type: "buffer" })
    const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])

    // Transform keys
    const transformedData = jsonData.map(obj => ({
      old_id: obj["№ п/п"],
      inner_id: obj["Код"].replace(" ", ""),
      name: obj["Повна назва товару"],
      price: Math.floor(parseFloat(obj["Ціна (грн.)"]))
    }))

    // Write JSON data to file
    const fileName = "./uploads/pricelist.json"
    fs.writeFile(fileName, JSON.stringify(transformedData, null, 2), err => {
      if (err) {
        console.error("Error writing file:", err)
        reject("Error writing file")
        return
      }
      console.log("File written successfully.")
      const arrayLength = transformedData.length
      resolve({ fileName, arrayLength })
    })
  })
}

exports.priceCompare = async function (exel, sitePromise) {
  try {
    const site = await sitePromise // Wait for the JSON data to be fetched

    // Filter Excel objects that have matching inner_id but different price in site
    let differentPrices = exel.filter(exelObj => {
      let siteObj = site.find(siteObj => siteObj.inner_id === exelObj.inner_id)
      if (siteObj && parseFloat(siteObj.price) !== parseFloat(exelObj.price)) {
        return true
      }
      return false
    })

    // Map the filtered objects to the desired format
    let result = differentPrices.map(exelObj => {
      let siteObj = site.find(siteObj => siteObj.inner_id === exelObj.inner_id)
      let comparison = {
        id: siteObj.ID,
        inner_id: exelObj.inner_id,
        inner_id_site: siteObj.inner_id,
        price_name: exelObj.name,
        site_name: siteObj.post_title,
        old_price: parseFloat(siteObj.price),
        new_price: parseFloat(exelObj.price)
      }

      return comparison
    })

    return result // Return the result array
  } catch (error) {
    console.error("Error:", error)
    return [] // Return an empty array in case of error
  }
}

exports.productsNotExistInSite = async function (exel, sitePromise) {
  try {
    const site = await sitePromise // Wait for the JSON data to be fetched

    // Filter Excel objects that don't have a matching inner_id in site
    let notExistInSite = exel.filter(exelObj => {
      return !site.some(siteObj => siteObj.inner_id === exelObj.inner_id)
    })

    // Map the filtered objects to the desired format
    let result = notExistInSite.map(exelObj => {
      return {
        id: exelObj.inner_id,
        name: exelObj.name,
        price: exelObj.price // You can include any other properties you need
      }
    })

    return result // Return the result array
  } catch (error) {
    console.error("Error:", error)
    return [] // Return an empty array in case of error
  }
}
