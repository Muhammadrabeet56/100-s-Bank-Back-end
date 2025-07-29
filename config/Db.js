const mongoose = require('mongoose');


const Connection = mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log('Connected to MongoDB')
})


module.exports = Connection;