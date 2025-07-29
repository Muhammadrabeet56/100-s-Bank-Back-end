const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const app = express()
const dbConnection = require('./config/Db');
dbConnection;
const cookieParser = require('cookie-parser');
const UserRoutes = require('./Routes/User.Route')
const cors = require('cors');
const path = require('path');
const AdminRoutes = require('./Routes/adminRoutes')
const bodyParser = require('body-parser');


app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Allow mobile apps with no origin
      if (
        origin.startsWith('http://192.168.') ||  // allow your local network
        origin === 'http://localhost:8081' ||
        origin === 'http://localhost:5173'      // allow if you're using web too
      ) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    credentials: true,
  }));
  
app.use('/uploads', express.static(path.join(__dirname, 'Public/uploads')));
app.use('/applications', express.static(path.join(__dirname, 'Public/applications')));
app.use(bodyParser.json({ limit: '50mb' ,   inflate: true,  })); // Increase from default 100kb

// Middleware to parse URL-encoded data (if needed)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());



app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.use('/users',UserRoutes)
app.use('/admin' ,AdminRoutes)
//payment routes


module.exports= app