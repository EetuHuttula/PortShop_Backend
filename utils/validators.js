// Input validation utilities

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

const isValidPassword = (password) => {
  // At least 8 chars, contains uppercase, lowercase, and number
  return password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password)
}

const isValidName = (name) => {
  // Only letters, spaces, hyphens, apostrophes - max 50 chars
  return name &&
    name.length <= 50 &&
    /^[a-zA-Z\s\-']{2,50}$/.test(name)
}

const sanitizeString = (str) => {
  if (typeof str !== 'string') return ''
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 500) // Max length
}

const validateRegistration = (fname, lname, email, password) => {
  const errors = {}

  if (!fname || !isValidName(fname)) {
    errors.fname = 'First name must be 2-50 letters only'
  }

  if (!lname || !isValidName(lname)) {
    errors.lname = 'Last name must be 2-50 letters only'
  }

  if (!email || !isValidEmail(email)) {
    errors.email = 'Invalid email address'
  }

  if (!password || !isValidPassword(password)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

const validateLogin = (email, password) => {
  const errors = {}

  if (!email) {
    errors.email = 'Email is required'
  }

  if (!password) {
    errors.password = 'Password is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidName,
  sanitizeString,
  validateRegistration,
  validateLogin
}
