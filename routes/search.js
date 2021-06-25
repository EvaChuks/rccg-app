// const express = require('express')
// const router = express.Router();
// const Testimony = require('../models/testimonial')
// const Sermon = require('../models/sermons')
// const Parish = require('../models/parish')

// router.get('/', async (req, res) => {
//     let perPage = 8;
//     let pageQuery = parseInt(req.query.page)
//     let pageNumber = pageQuery ? pageQuery : 1;
//     let noMatch = null;
//     if (req.body.search) {
//         let regex = new RegExp(escapeRegex(req.query.search), 'gi');
//         const sermon = await Sermon.find({ title: regex }).skip((perPage * pageNumber) - perPage).limit(perPage).exec()
//         let count = await Sermon.count({ title: regex }).exec()
//         res.render("sermon/index", {
//             sermon,
//             current: pageNumber,
//             pages: Math.ceil(count / perPage),
//             noMatch: noMatch,
//             search: false,
//             title: `${sermon.title}`
//         });
//     }
//     else if (req.body.search) {
//         let regex = new RegExp(escapeRegex(req.query.search), 'gi');
//         const testimony = await Testimony.find({ title: regex }).skip((perPage * pageNumber) - perPage).limit(perPage).exec()
//         let count = await Testimony.count({ title: regex }).exec()
//         res.render("testimony/index", {
//             testimony,
//             current: pageNumber,
//             pages: Math.ceil(count / perPage),
//             noMatch: noMatch,
//             search: false,
//             title: `${testimony.title}`
//         });

        
    
//     }
//     else if (req.body.search) {
//         let regex = new RegExp(escapeRegex(req.query.search), 'gi');
//         const parish = await Parish.find({ churchName: regex }).skip((perPage * pageNumber) - perPage).limit(perPage).exec()
//         let count = await Parish.count({ title: regex }).exec()
//         res.render("parish/index", {
//             parish,
//             current: pageNumber,
//             pages: Math.ceil(count / perPage),
//             noMatch: noMatch,
//             search: false,
//             title:`${parish.churchName}`
//         });


//     } else {
//         req.flash('error', 'No Match for your Search try again')
//         res.redirect('back')
        
//     }
            
                
// })



// function escapeRegex(text) {
//     return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
// };

// module.exports = router;