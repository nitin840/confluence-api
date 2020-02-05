const mongoose = require('mongoose')
const dbUrl = 'mongodb://localhost:27017/imageInfo'

mongoose.Promise = global.Promise

mongoose.connect(dbUrl,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useFindAndModify: false
}).then(()=>{
    console.log('successfully connected to database')
}).catch(()=>{
    console.log('unable to connect')
    process.exit()
});
