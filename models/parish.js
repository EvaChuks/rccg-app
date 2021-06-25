const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const imageSchema = new Schema({
    url: String,
    filename: String

});
imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_300,h_200')
})
const opts = { toJSON: { virtuals: true } }
const praishSchema = new Schema({
    churchName: String,

    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    location: String,
    email: String,
    phone: Number,
    description: String,

    images: [imageSchema],
    pastor: String,
    facebook: String,
    youtube: String,
    whatsapp: String,
    twitter: String,
    weeklyAct: String,
    monthlyAct: String,
    slug: {
        type: String,
        unique: true
    }
}, opts)
praishSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/parish/${this.slug}">${this.churchName}</a></strong>`
})
// add a slug before the parish gets saved to the database
praishSchema.pre('save', async function (next) {
    try {
        // check if a new campground is being saved, or if the parish name is being modified
        if (this.isNew || this.isModified("churchName")) {
            this.slug = await generateUniqueSlug(this._id, this.churchName);
        }
        next();
    } catch (err) {
        next(err);
    }
});
const Parish = mongoose.model('Parish', praishSchema);
module.exports = Parish;

async function generateUniqueSlug(id, parishName, slug) {
    try {
        // generate the initial slug
        if (!slug) {
            slug = slugify(parishName);
        }
        // check if a campground with the slug already exists
        const parish = await Parish.findOne({ slug: slug });
        // check if a campground was found or if the found campground is the current campground
        if (!parish || parish._id.equals(id)) {
            return slug;
        }
        // if not unique, generate a new slug
        let newSlug = slugify(parishName);
        // check again by calling the function recursively
        return await generateUniqueSlug(id, parishName, newSlug);
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