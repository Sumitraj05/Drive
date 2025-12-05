const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const userModel = require('../models/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// route - /user/register
router.get('/register', (req, res) => {
    res.render('register')
})

router.post('/register',
    body('email').trim().isEmail().isLength({ min: 12 }),
    body('password').trim().isLength({ min: 5 }),
    body('username').trim().isLength({ min: 3 }),
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Invalid data'
            })
        }
        const { email, username, password } = req.body;

        // Check if user already exists
        const existingUser = await userModel.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        const hashPassword = await bcrypt.hash(password, 10)
        await userModel.create({
            email,
            username,
            password: hashPassword
        })

        // Redirect to login page after successful registration
        res.redirect('/user/login')
    })

// route for login
router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/login',
    body('username').trim().isLength({ min: 3 }),
    body('password').trim().isLength({ min: 5 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: errors.array(),
                message: 'Invalid data'
            })
        }
        const { username, password } = req.body;

        const user = await userModel.findOne({
            username: username
        })

        if (!user) {
            return res.status(400).json({ success: false, message: 'username or password is incorrect' })

        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({
                message: 'username or password is incorrect'
            })
        }

        // jsonwebtoken
        const token = jwt.sign({
            userId: user._id,
            email: user.email,
            username: user.username
        },
            process.env.JWT_SECRET,
        )

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax', // ensures cookie works on localhost
            path: '/'         // make cookie accessible on all routes
        })
        res.json({ success: true, message: 'Logged In' })
    }
)

// ------------------------------
// Logout Route
// ------------------------------
router.get('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/'    // must match the cookie path used when setting it
    })
    res.redirect('/user/login')
})


module.exports = router
