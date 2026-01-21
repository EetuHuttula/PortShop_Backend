const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { validateLogin } = require('../utils/validators');
const loginRouter = express.Router();

loginRouter.post('/', async (request, response) => {
  const { email, password } = request.body;

  // Validation
  const { isValid, errors } = validateLogin(email, password);
  if (!isValid) {
    return response.status(400).json({ errors });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid email or password',
    });
  }

  const userForToken = {
    email: user.email,
    id: user._id,
    isAdmin: user.isAdmin
  };

  const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: '1h' });

  response.status(200).send({ token, email: user.email, name: user.fname, isAdmin: user.isAdmin });
});

module.exports = loginRouter;
