const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const cors = require('cors')
const mongoose = require('mongoose')
const path = require('path')
const multer = require('multer')

const middleware = require('./utils/middleware')
const logger = require('./utils/logger')

const productsRouter = require('./controllers/products')
const categoriesRouter = require('./controllers/categories')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const registerRouter = require('./controllers/register')
const adminRouter = require('./controllers/admin')
const ordersRouter = require('./controllers/orders')

const app = express()

// MongoDB setup
mongoose.set('strictQuery', false)
logger.info('connecting to', config.MONGODB_URI)
mongoose.connect(config.MONGODB_URI)
  .then(() => logger.info('connected to MongoDB'))
  .catch(error => logger.error('error connection to MongoDB:', error.message))

// JSON parsing
app.use(express.json())

// CORS - rajattu sallittuihin origin:iin
const allowedOrigins = [
  'http://localhost:3000',
  'https://portshop-red.vercel.app',
  'https://portshop-git-main-eetus-projects-06cd1cd1.vercel.app',
  'https://portshop-8nduql4fz-eetus-projects-06cd1cd1.vercel.app'
]

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Middleware
app.use(middleware.requestLogger)

// Serve uploaded files (note: ephemeral filesystem on Render/Fly.io)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, file.originalname)
})
const upload = multer({ storage })

// Routes
app.use('/api/categories', categoriesRouter)
app.use('/api/products', productsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/register', registerRouter)
app.use('/api/admin', adminRouter)
app.use('/api/orders', ordersRouter)

// Endpoint for file uploads
app.post('/api/upload', upload.single('image'), (req, res) => {
  res.status(201).send()
})

// Testing routes (only in test environment)
if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/tests')
  app.use('/api/testing', testingRouter)
}

// Error handling
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
