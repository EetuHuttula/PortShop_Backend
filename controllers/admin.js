const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { verifyToken } = require('../utils/middleware');

const adminRouter = express.Router();

// Only authenticated admin users can create new admin accounts
adminRouter.post('/', verifyToken, async (req, res) => {
    try {
        const requestingUser = await User.findById(req.user.id);
        if (!requestingUser || !requestingUser.isAdmin) {
            return res.status(403).json({ error: 'Only admins can create admin accounts' });
        }

        const { fname, lname, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const adminUser = new User({
            fname,
            lname,
            email,
            passwordHash,
            isAdmin: true
        });

        await adminUser.save();

        res.status(201).json({
            message: 'Admin profile created successfully',
            admin: {
                id: adminUser._id,
                fname: adminUser.fname,
                lname: adminUser.lname,
                email: adminUser.email,
                isAdmin: adminUser.isAdmin
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = adminRouter;
