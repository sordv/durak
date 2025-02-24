const express = require('express')
const router = express.Router()
const pool = require('../database')

// SCOREBOARD RENDER
router.get('/scoreboard', async (req, res) => {
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

module.exports = router