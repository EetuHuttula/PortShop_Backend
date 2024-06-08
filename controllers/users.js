const bcrypt = require('bcrypt');
const express = require('express');
const usersRouter = express.Router();
const User = require('../models/user');

usersRouter.get('/', async (request, response) => {
  try {
    const users = await User.find({});
    response.json(users);
  } catch (error) {
    response.status(500).json({ error: 'Something went wrong while fetching users' });
  }
});


usersRouter.get('/:id', async (request, response, next) => {
  try {
    const users = await User.findById(request.params.id);
      response.json(users)
  } catch (error) {
    next(error);
  }
});



usersRouter.post('/', async (request, response) => {
  const { fname, lname, email,isAdmin,  password } = request.body;

  if (!password || password.length < 8) {
    return response.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    fname,
    lname,
    email,
    isAdmin,
    passwordHash,
  });

  try {
    const savedUser = await user.save();
    response.status(201).json(savedUser);
  } catch (error) {
    response.status(500).json({ error: 'Something went wrong while saving the user' });
  }
});

usersRouter.delete('/:id', async (request, response, next) => {
  try {
    const user = await User.findById(request.params.id);
    if (!user) {
      return response.status(404).json({ error: 'User not found' });
    }

    await User.findByIdAndDelete(request.params.id);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
