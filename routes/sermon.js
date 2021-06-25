const express = require('express')
const router = express.Router()
const Sermon = require('../models/sermons')
const User = require('../models/users')
const { storage, cloudinary } = require('../cloudinary')
const multer = require('multer')
const upload = multer({ storage })
const { isLoggedIn, isAuthor, validateSermon } = require('../middleware')
const catchAsync = require('../utils/catchAsync')


// INDEX ROUTE
router.get('/', catchAsync(async (req, res) => {
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    let noMatch = null;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        const sermons = await Sermon.find({ title: regex }).skip((perPage * pageNumber) - perPage).limit(perPage).exec()
        const count = await Sermon.estimatedDocumentCount({ title: regex }).exec()
        if (sermons.length < 1) {
            noMatch = 'No Match for that query! Please try again';
        }
        res.render('sermon/index',
            {
                sermons, title: 'All sermons', noMatch,
                current: pageNumber,
                pages: Math.ceil(count / perPage),
                search: req.query.search
            })
        
    } else {
        const sermons = await Sermon.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec()
        const count = await Sermon.estimatedDocumentCount().exec()
        res.render('sermon/index',
            {
                sermons, title: 'All sermons', noMatch,
                current: pageNumber,
                pages: Math.ceil(count / perPage),
                search: false
            })
    }
}))
// NEW FORM ROUTE
router.get('/new', isLoggedIn, (req, res) => {
    res.render('sermon/new', { title: 'Share the word' })
})

// POST ROUTE
router.post('/', isLoggedIn, upload.array('image'), validateSermon, catchAsync(async (req, res, next) => {
    const sermon = new Sermon(req.body.sermon)
    sermon.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    sermon.author = req.user._id;
    await sermon.save()
    console.log(sermon)
    req.flash('success', 'successfully created Sermon')
    res.redirect(`/sermons`)
}))
// SHOW ROUTE
router.get('/:slug', catchAsync(async (req, res) => {
    const sermon = await Sermon.findOne({slug:req.params.slug}).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');

    if (!sermon) {
        req.flash('error', 'Cannot find that Sermon')
        return res.redirect('/sermons')
    }

    res.render('sermon/show', { sermon, title: `${sermon.title}` })
}))
// Edit Route
router.get('/:slug/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const sermon = await Sermon.findOne({slug:req.params.slug})
    if (!sermon) {
        req.flash('error', 'Cannot find that Sermon')
        return res.redirect('/sermons')
    }
    res.render('sermon/edit', { sermon, title: `update ${sermon.title}`, page: 'sermon/edit' })
}))

// Update Route
router.put('/:slug', isLoggedIn, isAuthor, upload.array('image'), validateSermon, catchAsync(async (req, res) => {
    // const { id } = req.params;
    const sermon = await Sermon.findOne({slug:req.params.slug})
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    sermon.images.push(...imgs)
    sermon.title = req.body.sermon.title;
    sermon.bibleText = req.body.sermon.bibleText;
    sermon.content = req.body.sermon.content;
    await sermon.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await sermon.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated Sermon')
    res.redirect(`/sermons/${sermon.slug}`)

}))
// Delete Route
router.delete('/:slug', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    // const { id } = req.params;
    const sermon = await Sermon.findOne({ slug: req.params.slug })
    sermon.remove();
    req.flash('success', 'Successfully deleted Sermon')
    res.redirect('/sermons')

}))
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
module.exports = router;