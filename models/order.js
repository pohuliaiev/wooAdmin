const axios = require("axios")
class Order {
  constructor() {
    this.type
    this.source
  }

  wooCart = req => {
    const body = req.body
    //  console.log(body)
    let products = body.line_items.map(function (item) {
      return {
        name: `${item.name} (<strong>${item.inner_id}</strong>)`,
        quantity: item.quantity,
        price: item.price
      }
    })
    const order = {
      id: body.id,
      date: this.convertDateTime(body.date_created),
      total: body.total,
      name: `${body.billing.first_name} ${body.billing.last_name}`,
      phone: body.billing.phone,
      email: body.billing.email,
      type: this.type,
      deliveryType: body.shipping_lines[0].method_title,
      deliveryAdres: `${body.billing.city} ${body.billing.address_1}`,
      payment: body.payment_method_title,
      products
    }
    //  console.log("Received order:", order)
    return order
  }

  contactForm = req => {
    const contactData = req.body

    //  console.log("Received contact form data:", contactData)

    return contactData
  }

  convertDateTime(dateTimeStr) {
    const date = new Date(dateTimeStr)

    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")

    return `${day}.${month}.${year} ${hours}:${minutes}`
  }
}
module.exports = Order
