const express = require('express')
const exphbs = require('express-handlebars')
const { Pool } = require('pg')

const app = express()

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
})

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended : true }))

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
    res.render('index')
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

const PORT = process.env.PORT || 2000

app.listen(PORT, () => {
    console.log(`SERVER HAS BEEN STARTED: http://localhost:${PORT}`)
})