const User = require('../models/users')
const Sermon = require('../models/sermons')
const Review = require('../models/reviews')
const ExpressError = require('../utils/ExpressError')
const { sermonSchema, reviewSchema, praishSchema, testimonialSchema, userSchema } = require('../schemas')
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must login first')
        return res.redirect('/login')
    }
    next();
}

module.exports.isNotVerified = async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (user.isVerified) {
            return next();
        }
        req.flash('error', `Your account is not yet verified check your ${user.email} for  verification link`);
        res.redirect('/');
    } catch (error) {
        console.log(error);
        req.flash('error', 'something went wrong! contact us for assistance');
        res.redirect('/');
    }

}

module.exports.isAuthor = async (req, res, next) => {
    // const { id } = req.params;
    const sermon = await Sermon.findOne({slug:req.params.slug});
    if (sermon.author.equals(req.user._id) || req.user.isAdmin) {
        console.log(req.user.isAdmin)
        next();

    } else {
        req.flash('error', 'You do not have permission to do that')
        return res.redirect(`/sermons/${slug}`)
    }

}
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (review.author.equals(req.user._id) || req.user.isAdmin) {
        console.log(req.user.isAdmin)
        next();
    } else {
        req.flash('error', 'You do not have permission to do that')
        return res.redirect(`/sermons/${id}`)
    }

}
// iSAdmin
module.exports.areYouAdmin = async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (req.user.isAdmin) {
            return next();
        }
    } catch (err) {
        req.flash('error', 'You are not an Admin')
        res.redirect('back')
    }
}
// SERMON VALIDATION
module.exports.validateSermon = (req, res, next) => {

    const { error } = sermonSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}
// PARISH VALIDATION
module.exports.validateParish = (req, res, next) => {

    const { error } = praishSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

// REVIEW VALIDATION
module.exports.validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

// TESTIMONY VALIDATION
module.exports.validateTestimony = (req, res, next) => {

    const { error } = testimonialSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}
