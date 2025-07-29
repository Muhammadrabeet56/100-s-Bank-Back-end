const http = require('http');

const app = require('./app')
const PORT = process.env.PORT


const Server = http.createServer(app)


Server.listen(PORT ,'0.0.0.0' ,()=>{
    console.log(`Server is running on port ${PORT}`)  //logging the server started message on the console.
})