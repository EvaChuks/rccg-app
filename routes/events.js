const express = require('express')
const router = express.Router()
const Event = require('../models/event');
const { storage, cloudinary } = require('../cloudinary')
const multer = require('multer')
const upload = multer({ storage })
const catchAsync = require('../utils/catchAsync')
const { isLoggedIn, isAdmin } = require('../middleware')

// Index Route
router.get('/', async (req, res) => {
    const events = await Event.find({})
   res.render('events/index', {events, title: `Up coming Events`}) 
})
// Event Form Route
router.get('/new', (req, res) => {
    res.render('events/new', { title: 'New Event' })
});
// Event Post Route
router.post('/', upload.array('image'), async (req, res) => {
    const event = new Event(req.body.event)
    event.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    await event.save()
    req.flash('success', 'New Event created')
    res.redirect(`/events`)
})
// Event Show Route
router.get('/:slug', async (req, res) => {
    const event = await Event.findOne({ slug: req.params.slug })
    if (!event) {
        req.flash('error', 'Cannot find that Event')
        return res.redirect('/events')
    }
    res.render('events/show', {event, title:`${event.title}`})
});
// Event Edit Route
router.get('/:slug/edit', async (req, res) => {
    const event = await Event.findOne({ slug: req.params.slug })
    if (!event) {
        req.flash('error', 'Cannot find that Event')
        return res.redirect(`/events/${event.slug}`)
    }
    res.render('events/edit', { event, title: `${event.title}` })
});
// Event Update Route
router.put('/:slug', upload.array('image'), async (req, res) => {
    const event = await Event.findOne({ slug: req.params.slug })
    const img = req.files.map(f => ({ url: f.path, filename: f.filename }))
    event.images.push(...img)
    event.title = req.body.event.title;
    event.venue = req.body.event.venue;
    event.starts = req.body.event.starts;
    event.ends = req.body.event.ends;
    event.time = req.body.event.time;
    event.host = req.body.event.host;
    event.description = req.body.event.description;
    await event.save();
     if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await event.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated Event')
    res.redirect(`/events/${event.slug}`)
})
// Event Delete Route
router.delete('/:slug', async (req, res) => {
    const event = await Event.findOne({ slug: req.params.slug })
    event.remove();
    req.flash('success', 'successfully deleted event')
    res.redirect('/events')
})


module.exports = router;