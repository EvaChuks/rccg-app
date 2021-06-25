const express = require('express')
const router = express.Router()
const Parish = require('../models/parish')
const User = require('../models/users')
const { storage, cloudinary } = require('../cloudinary')
const multer = require('multer')
const upload = multer({ storage })
const catchAsync = require('../utils/catchAsync')
const { isLoggedIn, areYouAdmin, validateParish } = require('../middleware')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })

// ROUTES
// Index Route
router.get('/', catchAsync(async (req, res) => {
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    let noMatch = null;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        const parishes = await Parish.find({ churchName: regex }).skip((perPage * pageNumber) - perPage).limit(perPage).exec()
        const count = await Parish.estimatedDocumentCount({ name: regex }).exec()
        if (parishes.length < 1) {
            noMatch = 'No Parish match that query, please try again';
        }
        res.render('parish/index',
            {
                parishes, title: 'All Our Parishes', noMatch,
                current: pageNumber,
                pages: Math.ceil(count / perPage),
                search: req.query.search
            })
    } else {
        const parishes = await Parish.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec()
        const count = await Parish.estimatedDocumentCount().exec()
        res.render('parish/index',
            {
                parishes, title: 'All Our Parishes', noMatch,
                current: pageNumber,
                pages: Math.ceil(count / perPage),
                search: false
            })
        
    }
    
}));
// New parish form
router.get('/new', isLoggedIn, areYouAdmin, (req, res) => {
    res.render('parish/new', { title: 'Create a Parish' })
})
// Post route
router.post('/', isLoggedIn, areYouAdmin, upload.array('image'), validateParish, catchAsync(async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.parish.location,
        limit: 2
    }).send()
    // console.log(geoData.body.features)
    const parish = new Parish(req.body.parish)
    parish.geometry = geoData.body.features[0].geometry;
    parish.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    await parish.save();
    console.log(parish)
    req.flash('success', 'successfully created a Parish')
    res.redirect('/parish')
}))

// Show Parish Route
router.get('/:slug', catchAsync(async (req, res) => {
    const parish = await Parish.findOne({ slug: req.params.slug })
    // console.log(parish)
    if (!parish) {
        req.flash('error', 'something went wrong')
        return res.redirect('/parish')
    }
    res.render('parish/show', { parish, title: `${parish.churchName}` })
}))

// Edit Parish Route
router.get('/:slug/edit', isLoggedIn, areYouAdmin, catchAsync(async (req, res) => {
    const parish = await Parish.findOne({slug: req.params.slug})
    if (!parish) {
        req.flash('error', 'Something went wrong')
        return res.redirect('/parish')
    }
    res.render('parish/edit', { parish, title: `update ${parish.churchName}` })
}))
// Update Parish Route
router.put('/:slug', isLoggedIn, areYouAdmin, upload.array('image'), validateParish, catchAsync(async (req, res) => {
   
    const parish = await Parish.findOne({ slug: req.params.slug })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    parish.images.push(...imgs)
    parish.churchName = req.body.parish.churchName;
    parish.location = req.body.parish.location;
    parish.email = req.body.parish.email;
    parish.phone = req.body.parish.phone;
    parish.description = req.body.parish.description;
    parish.pastor = req.body.parish.pastor;
    parish.facebook = req.body.parish.facebook;
    parish.youtube = req.body.parish.youtube;
    parish.whatsapp = req.body.parish.whatsapp;
    parish.twitter = req.body.parish.twitter;
    parish.monthlyAct = req.body.parish.monthlyAct;
    
    await parish.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await parish.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }

    req.flash('success', 'Successfully updated Parish')
    res.redirect(`/parish/${parish._id}`)
}))

router.delete('/:slug', isLoggedIn, areYouAdmin, catchAsync(async (req, res) => {
    // const { images } = req.flies;
    const parish = await Parish.findOne({ slug: req.params.slug })
    parish.remove()
    req.flash('success', 'Successfully deleted a Parish')
    res.redirect('/parish')

}))




function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
module.exports = router;