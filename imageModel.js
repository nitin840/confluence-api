var mongoose = require('mongoose')
const schema = mongoose.Schema({
    id: mongoose.Types.ObjectId,
    email: String,
    name: String,
    image: String
},{
    timestamps:true
})

module.exports = mongoose.model('images',schema)