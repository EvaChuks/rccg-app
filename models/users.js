const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose')
const imageSchema = new Schema({
    url: String,
    filename: String

});
imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_395,h_480')
})
const opts = { toJSON: { virtuals: true } }
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    images: [imageSchema],
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        unique: true,
        required: true
    },
    description: String,
    location: String,
    department: String,
    isVerified: Boolean,
    emailToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: { type: Boolean, default: false },
    sermons: {

        type: Schema.Types.ObjectId,
        ref: 'Sermon'
    }
}, opts);
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema)