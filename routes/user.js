const express = require('express')
const User = require('../models/users')
const Sermon = require('../models/sermons')
const passport = require('passport')
const router = express.Router()
const { storage, cloudinary } = require('../cloudinary')
const catchAsync = require('../utils/catchAsync')
const multer = require('multer')
const upload = multer({ storage })
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const { isNotVerified } = require('../middleware')
// Mailer config
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ROUTES
router.get('/register', (req, res) => {
    res.render('users/register', { title: 'Registration Form' })
})
// register post route
router.post('/register', upload.array('image'), async (req, res, next) => {
    try {
        const { firstname, lastname, phone, email, username, password, description, location, department } = req.body;
        const emailToken = crypto.randomBytes(64).toString('hex');
        const isVerified = false;

        const user = new User({ firstname, email, username, emailToken, isVerified, lastname, phone, description, location, department })
        user.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
        const registerdUser = await User.register(user, password)
        // registerdUser.images
        // user.sermons = req.sermon._id;
        console.log(registerdUser)
        // mailer
        const msg = {
            from: 'codewithchuks@gmail.com',
            to: user.email,
            subject: 'RCCG verification mail',
            text: `
Hello, thanks for registering on our site, click copy and paste the below url to verify your account http://${req.headers.host}/verify-email/?token=${user.emailToken}`,
            html: `
<h1>Hello,</h1><p>thanks for registering on our site</p><p>click copy and paste the below url to verify your account.</p><a href="http://${req.headers.host}/verify-email/?token=${user.emailToken}">Verify your account</a>`
            // http://' + req.headers.host + '/reset/' + token + 	  
        };
        try {
            await sgMail.send(msg);
            req.flash('success', 'Thank you for registering, check your email for verification link');
            res.redirect('/');

        } catch (error) {
            console.error(error);
            if (error.response) {
                console.error(error.response.body)
            }
            req.flash('error', 'Sorry, something went wrong, please contact admin@website.com');
            res.redirect('back');
        }

    } catch (e) {
        console.log('error', e.message)
        req.flash('error', 'User with the given username and email already exit')
        res.redirect('/register')
    }

})
// Admin 
router.get('/admin', (req, res) => {
    res.render('users/admin', { title: 'Admin Form' })
})
// Post Admin Route
router.post('/admin', upload.array('image'), async (req, res) => {
    try {
        const { firstname, lastname, phone, email, username, password, description, location, department } = req.body;
        const emailToken = crypto.randomBytes(64).toString('hex');
        const isVerified = false;

        const admin = new User({ firstname, email, username, emailToken, isVerified, lastname, phone, description, location, department })
        if (req.body.admincode === 'SecretPlaceOfMostHigh@123') {
            admin.isAdmin = true;
        }
        admin.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
        const registerdUser = await User.register(admin, password)
        // registerdUser.images
        // user.sermons = req.sermon._id;
        console.log(registerdUser)
        // mailer
        const msg = {
            from: 'codewithchuks@gmail.com',
            to: admin.email,
            subject: 'RCCG verification mail',
            text: `
Hello, thanks for registering on our site, click copy and paste the below url to verify your account http://${req.headers.host}/verify-email/?token=${admin.emailToken}`,
            html: `
<h1>Hello,</h1><p>thanks for registering on our site</p><p>click copy and paste the below url to verify your account.</p><a href="http://${req.headers.host}/verify-email/?token=${admin.emailToken}">Verify your account</a>`
            // http://' + req.headers.host + '/reset/' + token + 	  
        };
        try {
            await sgMail.send(msg);
            req.flash('success', 'Thank you for registering, check your email for verification link');
            res.redirect('/');

        } catch (error) {
            console.error(error);
            if (error.response) {
                console.error(error.response.body)
            }
            req.flash('error', 'Sorry, something went wrong, please contact admin@website.com');
            res.redirect('back');
        }

    } catch (e) {
        console.log('error', e.message)
        req.flash('error', 'User with the given username and email already exit')
        res.redirect('/admin')
    }

})
// verify-email Route
router.get('/verify-email', async (req, res, next) => {
    try {
        const user = await User.findOne({ emailToken: req.query.token });
        if (!user) {
            req.flash('error', 'Invalid Token, contact us for assistance');
            return res.redirect('/');
        }
        user.emailToken = null;
        user.isVerified = true;
        await user.save();
        await req.login(user, async (err) => {
            if (err) return next(err);
            req.flash('success', `Welcome to RCCG INDIA PROVINCE II ${user.username}`);
            const redirectUrl = req.session.returnTo || '/';
            delete req.session.returnTo;
            res.redirect(redirectUrl);
        });
    } catch (error) {
        console.log(error);
        req.flash('error', 'Invalid Token, contact us for assistance');
        res.redirect('/');

    }
})

// LOGIN ROUTES
router.get('/login', (req, res) => {
    res.render('users/login', { title: 'Login Form' })
})

router.post('/login', isNotVerified, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome back')
    const redirectUrl = req.session.returnTo || '/contact'
    delete req.session.returnTo
    res.redirect(redirectUrl)
})
// LOGOUT
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Thanks for stopping by')
    res.redirect('/')
})

// PROFILE ROUTE
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('sermons')

        const sermons = await Sermon.find().where('author').equals(user._id).exec()
        console.log(sermons)
        res.render('users/show', { user, sermons, title: `${user.firstname}` })

        // res.render('users/profile', { user })
    } catch (err) {
        req.flash('error', err.message)
        return res.redirect('back')
    }


})


module.exports = router;