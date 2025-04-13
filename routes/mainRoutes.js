const express = require('express')
const router = express.Router()

// / RENDER
router.get('/', (req, res) => {
    const isLogin = Boolean(req.session.userId)
    res.render('index', {isLogin})
    req.session.game = null
})

module.exports = router