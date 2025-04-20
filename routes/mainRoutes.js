const express = require('express')
const router = express.Router()

// рендер главного меню
router.get('/', (req, res) => {
    // если в текущей сессии есть userId, то будет true, иначе - false
    const isLogin = Boolean(req.session.userId)
    // реднерим страницу главного меню и передаем ей переменную
    res.render('index', {isLogin})
    // удаляем game из сессии (для выхода в главное меню из самой игры)
    req.session.game = null
})

module.exports = router