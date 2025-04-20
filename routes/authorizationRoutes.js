const express = require('express')
const router = express.Router()
const pool = require('../database')

// рендер страницы login.hbs
router.get('/login', (req, res) => {
    res.render('login')
})

// обработка нажатия на кнопку входа
router.post('/login', async (req, res) => {
    // получение введеных данных из формы
    const { login, password } = req.body

    try {
        // запрос к БД чтоб достать все записи о введеном логине
        const result = await pool.query(
            'SELECT * FROM players WHERE login = $1', [login]
        )

        // если нашлось 0 записей с таким логином, то ошибка
        if (result.rows.length === 0) {
            return res.status(400).send('Пользователь с таким логином не зарегистрирован!')
        }

        // если запись есть, то это и есть этот пользователь
        const user = result.rows[0]

        // проверяем введенный пароль и пароль из БД
        if (password !== user.password) {
            return res.status(400).send('Неверный пароль!')
        }

        // добавляем в сессию информацию об id и login текущего пользователя
        req.session.userId = user.id
        req.session.login = user.login

        // перенавравляем на главную страницу
        res.redirect('/')
    } catch (err) {
        console.error('Logging error with:', err)
        res.status(500).send('SERVER ERROR')
    }
})

// рендер страницы register.hbs
router.get('/register', (req, res) => {
    res.render('register')
})

// обработка нажатия на кнопку регистрации
router.post('/register', async (req, res) => {
    // получение введеных данных из формы
    const { login, password, confirm_password } = req.body

    // проверки ошибок без обращения к БД
    if (password.length < 8) {
        return res.status(400).send('Пароль должен содержать не менее 8 символов!')
    }

    if (password !== confirm_password) {
        return res.status(400).send('Пароли не совпадают!')
    }

    // обращение к БД
    try {
        // запрос на получение записей о пользователе по логину
        const userExists = await pool.query(
            'SELECT * FROM players WHERE login = $1', [login]
        )

        // если таких записей не 0, значит логин уже занят
        if (userExists.rows.length > 0) {
            return res.status(400).send('Пользователь с таким логином уже существует!')
        }

        // запрос на создание записи о новом пользователя
        await pool.query(
            'INSERT INTO players (login, password) VALUES ($1, $2)',
            [login, password]
        )

        // перенаправление на страницу входа
        res.redirect('/login')
    } catch (err) {
        console.error('Registration failure with:', err)
        res.status(500).send('SERVER ERROR')
    }
})

// обработка нажатия на кнопку выхода (находится на главной странице)
router.post('/logout', (req, res) => {
    req.session.destroy((err) => { // удаление текущей сессии
        if (err) {
            console.error('Logout failure with:', err)
            return res.status(500).send('SERVER ERROR')
        }
        // перенаправляет на главную страницу
        res.redirect('/')
    })
})

module.exports = router