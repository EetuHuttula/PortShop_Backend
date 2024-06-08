const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const loginRouter = express.Router();

loginRouter.post('/', async (request, response) => {
  const { email, password } = request.body;

  const user = await User.findOne({ email });
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
    isAdmin: user.isAdmin // Add isAdmin property
  };

  const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: '1h' });

  response.status(200).send({ token, email: user.email, name: user.fname, isAdmin: user.isAdmin }); // Include isAdmin property in the response
});

module.exports = loginRouter;
