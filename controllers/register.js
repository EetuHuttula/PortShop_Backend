const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const registerRouter = express.Router();

// Registration endpoint
registerRouter.post('/', async (request, response) => {
  const { fname, lname, email, password } = request.body;

  // Validation
  if (!email || !password) {
    return response.status(400).json({ error: 'Email and password are required' });
  }

  if (!fname || !lname) {
    return response.status(400).json({ error: 'First name and last name are required' });
  }

  if (password.length < 8) {
    return response.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return response.status(400).json({ error: 'Email already in use' });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    fname,
    lname,
    email,
    isAdmin: false,
    passwordHash,
  });

  try {
    const savedUser = await user.save();
    
    const userForToken = {
      email: savedUser.email,
      id: savedUser._id,
      isAdmin: savedUser.isAdmin
    };

    const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: '1h' });

    response.status(201).json({
      token,
      email: savedUser.email,
      name: savedUser.fname,
      isAdmin: savedUser.isAdmin
    });
  } catch (error) {
    response.status(500).json({ error: 'Something went wrong while registering' });
  }
});

module.exports = registerRouter;
