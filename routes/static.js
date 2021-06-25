const express = require('express');
const router = express.Router();

router.get('/mandate', (req, res) => {
    res.render('static/mandate', { title: 'Our Mandate' })
});
// 
router.get('/our-history', (req, res) => {
    res.render('static/our-history', { title: 'Our History' })

})

router.get('/our-beliefs', (req, res) => {
    res.render('static/our-belief', { title: 'Our Belief' })
})
router.get('/daddy-go', (req, res) => {
    res.render('static/daddy-go', { title: 'Daddy GO' })
})
router.get('/mummy-go', (req, res) => {
    res.render('static/mummy-go', { title: 'Mummy GO' })
})
router.get('/our-trustees', (req, res) => {
    res.render('static/our-trustees', { title: 'Our Trustees' })
})
router.get('/zonal-pastors', (req, res) => {
    res.render('static/zonal-pastors', { title: 'Zonal Pastors' })
})
router.get('/headquaters', (req, res) => {
    res.render('static/headquaters', { title: 'HeadQuaters' })
})
router.get('/our-ministeries', (req, res) => {
    res.render('static/our-ministeries', { title: 'Our Ministeries', page: 'contact' })
})


module.exports = router;