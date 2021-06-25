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
const testimonialSchema = new Schema({
    title: String,
    images: [imageSchema],
    body: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    slug: {
        type: String,
        unique: true
    }
}, opts)


// add a slug before the parish gets saved to the database
testimonialSchema.pre('save', async function (next) {
    try {
        // check if a new testimony is being saved, or if the testimony name is being modified
        if (this.isNew || this.isModified("title")) {
            this.slug = await generateUniqueSlug(this._id, this.title);
        }
        next();
    } catch (err) {
        next(err);
    }
});
const Testimony = mongoose.model('Testimony', testimonialSchema)
module.exports = Testimony;

async function generateUniqueSlug(id, testimonyName, slug) {
    try {
        // generate the initial slug
        if (!slug) {
            slug = slugify(testimonyName);
        }
        // check if a testimony with the slug already exists
        const testimony = await Testimony.findOne({ slug: slug });
        // check if a testimony was found or if the found testimony is the current testimony
        if (!testimony || testimony._id.equals(id)) {
            return slug;
        }
        // if not unique, generate a new slug
        let newSlug = slugify(testimonyName);
        // check again by calling the function recursively
        return await generateUniqueSlug(id, testimonyName, newSlug);
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