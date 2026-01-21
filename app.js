const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const cors = require('cors')
const mongoose = require('mongoose')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

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

// JSON parsing - with size limit to prevent large payload attacks
app.use(express.json({ limit: '10mb' }))

// Security headers
app.use(helmet())

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 attempts per windowMs on auth endpoints
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true, // don't count successful requests
})

// Apply general rate limiting to all routes
app.use(generalLimiter)

// JSON parsing
app.use(express.json({ limit: '10mb' }))

// CORS - rajattu sallittuihin origin:iin
const allowedOrigins = [
  'http://localhost:3000',
  'https://portshop-red.vercel.app',
  'https://portshop-git-main-eetus-projects-06cd1cd1.vercel.app',
  'https://portshop-8nduql4fz-eetus-projects-06cd1cd1.vercel.app'
]

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// Middleware
app.use(middleware.requestLogger)

// Routes
app.use('/api/categories', categoriesRouter)
app.use('/api/products', productsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', authLimiter, loginRouter)
app.use('/api/register', authLimiter, registerRouter)
app.use('/api/admin', adminRouter)
app.use('/api/orders', ordersRouter)

// Testing routes (only in test environment)
if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/tests')
  app.use('/api/testing', testingRouter)
}

// Error handling
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
