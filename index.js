const express = require('express')
const app = express()

var imageRouter = require('./controller')
app.use('/confluence',imageRouter)

module.exports = app