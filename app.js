const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const path = require('path'); // Import the path module for handling file paths
const multer = require('multer'); // Import multer for handling file uploads

const productsRouter = require('./controllers/products')
const categoriesRouter = require('./controllers/categories')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Specify the directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // Specify the file name for the uploaded file
  }
});

const upload = multer({ storage: storage });

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files from the uploads directory

console.log('NODE_ENV:', process.env.NODE_ENV);
if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/tests') 
  app.use('/api/testing', testingRouter)
  console.log('Running in test environment');
}

app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);

// Endpoint for uploading files
app.post('/api/upload', upload.single('image'), (req, res) => {
  res.status(201).send(); // Return a success response after the file is uploaded
});

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
