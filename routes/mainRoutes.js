const express = require('express')
const router = express.Router()

// / RENDER
router.get('/', (req, res) => {
    const isLogin = Boolean(req.session.userId)
    res.render('index', {isLogin})
})

module.exports = router