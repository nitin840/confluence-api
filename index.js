const express = require('express')
const app = express()

var db = require('./db')

var imageRouter = require('./imageController')
app.use('/image',imageRouter)

module.exports = app