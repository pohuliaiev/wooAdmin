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
        name: `${item.name} (${item.inner_id})`,
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
    let message = `Номер заказа: ${body.id}\n
  Имя: ${body.billing.first_name} ${body.billing.last_name}\n
  Сумма: ${body.total}\n
  Номер телефона: ${body.billing.phone}\n
  Email: ${body.billing.email}\n
  Тип доставки: ${body.shipping_lines[0].method_title}\n
  Номер отделения: ${body.billing.city} ${body.billing.address_1}\n
  Тип оплаты: ${body.payment_method_title}\n
  Товары:\n`
    products.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (Количество: ${item.quantity})\n`
    })
    return { order, message }
  }

  contactForm = req => {
    const contactData = req.body

    let message = `Тип: ${this.type}\nНомер телефона: ${contactData.phone}\n`
    message += contactData.products ? `Товар: ${contactData.products}\n` : ""
    message += contactData.total ? `Сумма: ${contactData.total}\n` : ""

    return { contactData, message }
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
