const express = require('express')
const router = express.Router()

// рендер главного меню
router.get('/', (req, res) => {
    // если в текущей сессии есть userId, то будет true, иначе - false
    const isLogin = Boolean(req.session.userId)
    //let login = null
    //if (isLogin) { login = req.session.login }
    const login = req.session.login
    // реднерим страницу главного меню и передаем ей переменную
    res.render('main', {isLogin, login})
    // удаляем game из сессии (для выхода в главное меню из самой игры)
    req.session.game = null
})

module.exports = router