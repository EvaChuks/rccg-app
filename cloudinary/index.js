const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET


})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'yelpcamp',
        allowedFormats: ['jpeg', 'png', 'jpg'],// async (req, file) => 'png', // supports promises as well
        // public_id: (req, file) => 'computed-filename-using-request',
    },
});

module.exports = {
    cloudinary, storage
};