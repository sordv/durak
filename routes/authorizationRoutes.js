const express = require('express')
const router = express.Router()
const pool = require('../database')

// LOGIN RENDER
router.get('/login', (req, res) => {
    res.render('login')
})

// LOGIN PROCESSING
router.post('/login', async (req, res) => {
    const { login, password } = req.body

    try {
        const result = await pool.query(
            'SELECT * FROM players WHERE login = $1', [login]
        )

        if (result.rows.length === 0) {
            return res.status(400).send('Пользователь с таким логином не зарегистрирован!')
        }

        const user = result.rows[0]

        if (password !== user.password) {
            return res.status(400).send('Неверный пароль!')
        }

        req.session.userId = user.id
        req.session.login = user.login

        res.redirect('/')
    } catch (err) {
        console.error('Ошибка при входе:', err)
        res.status(500).send('Ошибка сервера')
    }
})

// REGISTER RENDER
router.get('/register', (req, res) => {
    res.render('register')
})

// REGISTER PROCESSING
router.post('/register', async (req, res) => {
    const { login, password, confirm_password } = req.body

    if (password !== confirm_password) {
        return res.status(400).send('Пароли не совпадают')
    }

    try {
        const userExists = await pool.query(
            'SELECT * FROM players WHERE login = $1', [login]
        )

        if (userExists.rows.length > 0) {
            return res.status(400).send('Пользователь с таким логином уже существует')
        }

        await pool.query(
            'INSERT INTO players (login, password) VALUES ($1, $2)',
            [login, password]
        )

        res.redirect('/login')
    } catch (err) {
        console.error('Ошибка при регистрации:', err)
        res.status(500).send('Ошибка сервера')
    }
})

// LOGOUT PROCESSING
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Ошибка при выходе из аккаунта:', err)
            return res.status(500).send('Ошибка сервера')
        }
        res.redirect('/')
    })
})

module.exports = router