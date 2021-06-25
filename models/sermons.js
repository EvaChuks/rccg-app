const mongoose = require('mongoose');
const Review = require('./reviews')
const Schema = mongoose.Schema;
const imageSchema = new Schema({
    url: String,
    filename: String

});
imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_300,h_200')
})
const opts = { toJSON: { virtuals: true } }
const sermonSchema = new Schema({
    title: String,
    images: [imageSchema],
    bibleText: String,
    content: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: { type: Date, default: Date.now },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    slug: {
        type: String,
        unique: true
    }
}, opts)
// add a slug before the sermon gets saved to the database
sermonSchema.pre('save', async function (next) {
    try {
        // check if a new sermon is being saved, or if the sermon name is being modified
        if (this.isNew || this.isModified("title")) {
            this.slug = await generateUniqueSlug(this._id, this.title);
        }
        next();
    } catch (err) {
        next(err);
    }
});

sermonSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})
const Sermon = mongoose.model('Sermon', sermonSchema)
module.exports = Sermon;
async function generateUniqueSlug(id, sermonTitle, slug) {
    try {
        // generate the initial slug
        if (!slug) {
            slug = slugify(sermonTitle);
        }
        // check if a campground with the slug already exists
        const sermon = await Sermon.findOne({ slug: slug });
        // check if a sermon was found or if the found sermon is the current sermon
        if (!sermon || sermon._id.equals(id)) {
            return slug;
        }
        // if not unique, generate a new slug
        let newSlug = slugify(sermonTitle);
        // check again by calling the function recursively
        return await generateUniqueSlug(id, sermonTitle, newSlug);
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
