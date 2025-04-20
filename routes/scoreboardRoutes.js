const express = require('express')
const router = express.Router()
const pool = require('../database')

// рендер таблицы лидеров
router.get('/scoreboard', async (req, res) => {
    try {
        // запрос на 5 самых лучших по рейтингу
        const result = await pool.query(
            'SELECT login, rating, wins FROM players ORDER BY rating DESC LIMIT 5'
        )
        const players = result.rows

        res.render('scoreboard', { players })
    } catch (err) {
        console.error('Database query FAILED with:', err)
        res.status(500).send('SERVER ERROR')
    }
})

module.exports = router