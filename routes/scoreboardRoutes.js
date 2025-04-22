const express = require('express')
const router = express.Router()
const pool = require('../database')

// рендер таблицы лидеров: количество начатых игр + количество законченых игр
router.get('/scoreboard', async (req, res) => {
    try {
        // запрос к бд
        const result = await pool.query(
            'SELECT login, starts, ends FROM players ORDER BY starts DESC'
        )
        const players = result.rows

        res.render('scoreboard', {players})
    } catch (err) {
        console.error('Database query FAILED with:', err)
        res.status(500).send('SERVER ERROR')
    }
})

/*
// рендер таблицы лидеров: рейтинг + победы
router.get('/scoreboard', async (req, res) => {
    try {
        // запрос на самых лучших по рейтингу
        const result = await pool.query(
            'SELECT login, rating, wins FROM players ORDER BY rating DESC'
        )
        const players = result.rows

        res.render('scoreboard', { players })
    } catch (err) {
        console.error('Database query FAILED with:', err)
        res.status(500).send('SERVER ERROR')
    }
})
*/
module.exports = router