const express = require("express")
const session = require("express-session")
const fileUpload = require("express-fileupload")
const app = express()

app.use(
  session({
    secret: "blablablab12345",
    resave: false,
    saveUninitialized: true
  })
)

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
  next()
})

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

const router = require("./router")

app.use(express.static("public"))
app.set("views", "views")
app.set("view engine", "ejs")

app.use(fileUpload())

app.use("/", router)

app.listen(3000)

module.exports = app
