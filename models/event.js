const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const imageSchema = new Schema({
    url: String,
    filename: String,
});
imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_570,h_380')
});
const opts = { toJSON: { virtuals: true } }
const eventSchema = new Schema({
    title: String,
    venue: String,
    starts: String,
    ends: String,
    time: String,
    images: [imageSchema],
    host: String,
    description: String,
    slug: {
        type: String,
        unique: true
    }
}, opts);
// add a slug before the parish gets saved to the database
eventSchema.pre('save', async function (next) {
    try {
        // check if a new campground is being saved, or if the parish name is being modified
        if (this.isNew || this.isModified("title")) {
            this.slug = await generateUniqueSlug(this._id, this.title);
        }
        next();
    } catch (err) {
        next(err);
    }
});
const Event = mongoose.model('Event', eventSchema);
module.exports = Event;

async function generateUniqueSlug(id, eventName, slug) {
    try {
        // generate the initial slug
        if (!slug) {
            slug = slugify(eventName);
        }
        // check if a campground with the slug already exists
        const event = await Event.findOne({ slug: slug });
        // check if a campground was found or if the found campground is the current campground
        if (!event || event._id.equals(id)) {
            return slug;
        }
        // if not unique, generate a new slug
        let newSlug = slugify(eventhName);
        // check again by calling the function recursively
        return await generateUniqueSlug(id, eventName, newSlug);
    } catch (err) {
        throw new Error(err);
    }
}

function slugify(text) {
    let slug = text.toString().toLowerCase()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '')          // Trim - from end of text
        .substring(0, 75);           // Trim at 75 characters
    return slug + "-" + Math.floor(1000 + Math.random() * 9000);  // Add 4 random digits to improve uniqueness
}