const express = require('express')
const exphbs = require('express-handlebars')
const { Pool } = require('pg')
const session = require('express-session')

const app = express()

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
})

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: false
}))

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'durak',
    password: 'admin',
    port: 5432,
})

app.get('/', (req, res) => {
    const isLogin = !!req.session.userId
    res.render('index', {isLogin})
})

app.get('/scoreboard', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT login, rating, wins FROM players ORDER BY rating DESC LIMIT 3'
        )
        const players = result.rows

        res.render('scoreboard', { players })
    } catch (err) {
        console.error('Database query FAILED:', err)
        res.status(500).send('Ошибка сервера')
    }
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/login', async (req, res) => {
    const { login, password } = req.body

    try {
        const result = await pool.query(
            'SELECT * FROM players WHERE login = $1', [login]
        )

        if (result.rows.length === 0) {
            return res.status(400).send('Пользователь с таким логином не зарегистрирован!')
        }

        const user = result.rows[0];

        if (password !== user.password) {
            return res.status(400).send('Неверный пароль')
        }

        req.session.userId = user.id
        req.session.login = user.login

        res.redirect('/')
    } catch (err) {
        console.error('Ошибка при входе:', err)
        res.status(500).send('Ошибка сервера')
    }
})

app.post('/register', async (req, res) => {
    const { login, password, confirm_password } = req.body

    if (password !== confirm_password) {
        return res.status(400).send('Пароли не совпадают');
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

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Ошибка при выходе из аккаунта:', err)
            return res.status(500).send('Ошибка сервера')
        }
        res.redirect('/')
    })
})

const PORT = process.env.PORT || 2004

app.listen(PORT, () => {
    console.log(`SERVER HAS BEEN STARTED: http://localhost:${PORT}`)
})