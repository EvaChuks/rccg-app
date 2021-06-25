const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});
const Joi = BaseJoi.extend(extension);
module.exports.sermonSchema = Joi.object({
    sermon: Joi.object({
        title: Joi.string().required().escapeHTML(),
        bibleText: Joi.string().required().escapeHTML(),
        // image: Joi.string().required(),
        // location: Joi.string().required().escapeHTML(),
        content: Joi.string().required()

    }).required(),
    deleteImages: Joi.array()

});
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required().escapeHTML(),
        rating: Joi.number().required().min(1).max(5)

    }).required()

});
module.exports.praishSchema = Joi.object({
    parish: Joi.object({
        churchName: Joi.string().required().escapeHTML(),
        location: Joi.string().required().escapeHTML(),
        email: Joi.string().required().escapeHTML(),
        phone: Joi.number().required().min(0),
        description: Joi.string().required(),
        pastor: Joi.string().required().escapeHTML(),
        facebook: Joi.string().required().escapeHTML(),
        youtube: Joi.string().required().escapeHTML(),
        whatsapp: Joi.string().required().escapeHTML(),
        twitter: Joi.string().required().escapeHTML(),
        // weeklyAct: Joi.string().required(),
        monthlyAct: Joi.string().required()


    }).required(),
    deleteImages: Joi.array()
});

module.exports.testimonialSchema = Joi.object({
    testimony: Joi.object({
        title: Joi.string().required().escapeHTML(),
        body: Joi.string().required()

    }).required(),
    deleteImages: Joi.array()
});

module.exports.userSchema = Joi.object({
    user: Joi.object({
        email: Joi.string().required().escapeHTML(),
        firstname: Joi.string().required().escapeHTML(),
        lastname: Joi.string().required().escapeHTML(),
        phone: Joi.number().required().min(0),
        description: Joi.string().required().escapeHTML(),
        location: Joi.string().required().escapeHTML(),
        department: Joi.string().required().escapeHTML(),
        isAdmin: Joi.string().required().escapeHTML()



    }).required()

})