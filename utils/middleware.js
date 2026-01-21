const logger = require('./logger')
const jwt = require('jsonwebtoken')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const userExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  let token = null

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    token = authorization.substring(7)
  }

  try {
    if (token) {
      const decoded = jwt.verify(token, process.env.SECRET)
      request.user = decoded
    }
  } catch (error) {
    // Token invalid or expired, user will be undefined
  }

  next()
}

const verifyToken = (request, response, next) => {
  const authorization = request.get('authorization')
  let token = null

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    token = authorization.substring(7)
  }

  if (!token) {
    return response.status(401).json({ error: 'token missing' })
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET)
    request.user = decoded
  } catch (error) {
    return response.status(401).json({ error: 'token invalid or expired' })
  }

  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(400).json({ error: 'token missing or invalid' })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired' })
  }
  next(error)
}

module.exports = {
  requestLogger,
  userExtractor,
  verifyToken,
  unknownEndpoint,
  errorHandler
}