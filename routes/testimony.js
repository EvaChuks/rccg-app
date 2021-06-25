const express = require('express');
const router = express.Router({ mergeParams: true });
// const Sermon = require('../models/sermons')
const Testimony = require('../models/testimonial')
const { storage, cloudinary } = require('../cloudinary')
const multer = require('multer')
const upload = multer({ storage })
const { isLoggedIn, isAuthor, validateTestimony } = require('../middleware')
const catchAsync = require('../utils/catchAsync')

// ROUTES
router.get('/', catchAsync(async (req, res) => {
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    let noMatch = null;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        const testimonies = await Testimony.find({ title: regex }).skip((perPage * pageNumber) - perPage).limit(perPage).exec()
        const count = await Testimony.estimatedDocumentCount({ name: regex }).exec()
        console.log(req.query.search)
        if (testimonies.length < 1) {
            noMatch = "No Testimony match that query, please try again.";
        }
        
        res.render("testimony/index",
            {
                testimonies, noMatch,
                current: pageNumber,
                pages: Math.ceil(count / perPage),
                search: req.query.search
        });
          
    } else {
        const testimonies = await Testimony.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec()
        const count = await Testimony.estimatedDocumentCount().exec()
        console.log(testimonies)
        res.render('testimony/index',
            {
                testimonies, title: 'All Testimonies', noMatch,
                current: pageNumber,
                pages: Math.ceil(count / perPage),
                search: false
            })
        
    }
    
}))

// NEW TESTIMONY ROUTE
router.get('/new', isLoggedIn, (req, res) => {
    res.render('testimony/new', { title: 'Share your Testimony' })
})

// TESTIMONY POST ROUTE
router.post('/', isLoggedIn, upload.array('image'),validateTestimony, catchAsync(async (req, res) => {
    const testimony = new Testimony(req.body.testimony)
    testimony.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    testimony.author = req.user._id;
    await testimony.save();
    console.log(testimony)
    req.flash('success', 'You have successfully share your testimony')
    res.redirect(`/testimony/${testimony.slug}`)
}))

// TESTIMONY SHOW ROUTE
router.get('/:slug', catchAsync(async (req, res) => {
    try {
        const testimony = await Testimony.findOne({slug:req.params.slug}).populate('author')
        res.render('testimony/show', { testimony, title: `${testimony.title}` })
    } catch (error) {
        req.flash('error', 'No testimony was found')
        res.redirect('back')
    }

}))

// TESTIMONY EDIT ROUTE
router.get('/:slug/edit', isLoggedIn, catchAsync(async (req, res) => {
    try {
        const testimony = await Testimony.findOne({slug:req.params.slug})
        res.render('testimony/edit', { testimony, title: `Edit ${testimony.title}` })
    } catch (error) {
        req.flash('error', 'No testimony was found')
        res.redirect('/testimony')
    }


}))

// TESTIMONY UPDATE ROUTE
router.put('/:slug', isLoggedIn, upload.array('image'),validateTestimony, catchAsync(async (req, res) => {

    // const { id } = req.params;
    const testimony = await Testimony.findOne({slug: req.params.slug})
    const img = req.files.map(f => ({ url: f.path, filename: f.filename }))
    testimony.images.push(...img)
    testimony.title = req.body.testimony.title;
    testimony.body = req.body.testimony.body;
    await testimony.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await testimony.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    console.log(testimony)
    req.flash('success', 'Successfully updated Testimony')
    res.redirect(`/testimony/${testimony.slug}`)
}))

router.delete('/:slug', isLoggedIn, catchAsync(async (req, res) => {
    const testimony = await Testimony.findOne({ slug: req.params.slug })
    testimony.remove()
    req.flash('success', 'Testimony deleted')
    res.redirect('/testimony')
}))

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
module.exports = router;

