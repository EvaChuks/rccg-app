const express = require('express');
const router = express.Router();
const User = require('../models/users')
const crypto = require('crypto')
const Testimony = require('../models/testimonial')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const catchAsync = require('../utils/catchAsync')
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { isLoggedIn } = require('../middleware')
const Event = require('../models/event')

router.get('/', catchAsync(async (req, res) => {
    const testimonies = await Testimony.find({}).populate('author')
    const events = await Event.find({})
    res.render('index', { testimonies, events })
}));

// CONTACT US ROUTES
router.get('/contact', isLoggedIn, (req, res) => {
    res.render('contact', { title: 'Contact US' })
});
// POST /contact
router.post('/contact', isLoggedIn, catchAsync(async (req, res) => {
    let { name, email, message, subject } = req.body;
    const msg = {
        to: 'walter4chuks@gmail.com',
        from: 'codewithchuks@gmail.com',
        subject: subject,
        text: message,
        html: `
    <h1>Hi there, this email is from, ${name}</h1>
    <p>${message}</p>
    `,
    };
    try {
        await sgMail.send(msg);
        req.flash('success', 'Thank you for your email, we will get back to you shortly.');
        res.redirect('/contact');
    } catch (error) {
        console.error(error);
        if (error.response) {
            console.error(error.response.body)
        }
        req.flash('error', 'Sorry, something went wrong, please contact admin@website.com');
        res.redirect('back');
    }
}));

// FORGOT PASSWORD
router.get('/forgot', (req, res) => {
    res.render('users/forgot', { title: 'Forgot password' });
});
// forgot password logic
router.post('/forgot', catchAsync(async (req, res, next) => {
    let buf = crypto.randomBytes(20)
    let token = buf.toString('hex');
    try {
        const user = await User.findOne({ email: req.body.email })
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 1800000; // 1/2 hour

        await user.save(err => {
            console.log(err)
        })

        const msg = {
            to: user.email,
            from: 'codewithchuks@gmail.com',
            subject: "Password Reset",
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n',
            html: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n 
                    Please click on the following link, or paste this into your browser to complete the process:\n\n
                    http://${req.headers.host}/reset/${token}'\n\n'
                    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };
        try {
            await sgMail.send(msg);
            req.flash('success', `An e-mail has been sent to ${user.email} with further instructions.`);
            res.redirect('/contact');
        } catch (error) {
            console.error(error);
            if (error.response) {
                console.error(error.response.body)
            }
            req.flash('error', 'Sorry, something went wrong, please contact admin@website.com');
            res.redirect('back');
        }

    } catch (err) {
        if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot');
        }
        if (err) return next(err);
        res.redirect('/forgot');
    }
}));

// Reset Password
router.get('/reset/:token', catchAsync(async (req, res) => {
    try {
        const user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });
        res.render('users/reset', { title: 'Reset your password', token: req.params.token });

    } catch (error) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }

    }
}));
// Reset Password Logic
router.post('/reset/:token', catchAsync(async (req, res) => {
    try {
        const user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } })
        if (req.body.password === req.body.confirm) {
            await user.setPassword(req.body.password)
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save()
            req.login(user, err => {
                if (err) {
                    console.log('something went wrong', err)
                }
                req.flash('success', 'You have change your password successfully');
                res.redirect('/')
            });
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
        const msg = {
            to: user.email,
            from: 'codewithchuks@gmail.com',
            subject: "Your password has been changed",
            text: `Hello,\n\n'
                    This is a confirmation that the password for your account ${user.email} has just been changed.\n`,
            html: `Hello,\n\n'
                    This is a confirmation that the password for your account ${user.email} has just been changed.\n`
        };
        try {
            await sgMail.send(msg);
            req.flash('success', 'Success! Your password has been changed.');
            res.redirect('/');
        } catch (error) {
            console.error(error);
            if (error.response) {
                console.error(error.response.body)
            }
            req.flash('error', 'Sorry, something went wrong, please contact admin@website.com');
            res.redirect('back');
        }
    } catch (error) {
        console.log(error)
        req.flash('error', 'Password reset token is invalid or has expired.')
        res.redirect('/forgot')

    }
}));

module.exports = router;