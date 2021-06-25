const express = require('express');
const router = express.Router({ mergeParams: true });
const Sermon = require('../models/sermons')
const Review = require('../models/reviews')
const { isLoggedIn, validateReview } = require('../middleware')
const catchAsync = require('../utils/catchAsync')

// ROUTES
router.post('/reviews', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const sermon = await Sermon.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id;
    sermon.reviews.push(review)
    await sermon.save()
    await review.save()
    req.flash('success', 'Review successfully created')
    res.redirect(`/sermons/${sermon._id}`)
}))
router.delete('/reviews/:reviewId', isLoggedIn, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    await Sermon.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'deleted Review successfully ')
    res.redirect(`/sermons/${id}`)
}))


module.exports = router;