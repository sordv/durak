const express = require('express')
const router = express.Router()
const Game = require('../objects/game')
const pool = require('../database')

// middleware чтобы использовать json объекты
router.use((req, res, next) => {
    res.locals.json = obj => JSON.stringify(obj).replace(/<\/script>/g, '<\\/script>') // еще какая-то безопасность
    next()
})

// отображение страницы game.hbs
router.get('/game', async (req, res) => {
    // если сессия не имеет userId (вход не выполнен), то откроется страница login
    if (!req.session.userId) { return res.redirect('/login') }
    // есть ли игра в сессии
    const isNewGame = !req.session.game
    // из сессии достается game если есть, если нет, то создается
    const game = req.session.game || new Game()
    req.session.game = game

    // обновляем базу данных
    if (isNewGame && req.session.login) {
        try {
            await pool.updateStarts(req.session.login)
        } catch (err) {
            console.error('Update starts failed with:', err)
        }
    }

    // достаются значение из текущего объекта game чтоб передать game.hbs
    res.render('game', {
        currentDeck: game.currentDeck,
        playerHand: game.playerHand,
        botHand: game.botHand,
        trump: game.trump,
        isPlayerTurn: game.isPlayerTurn,
        isGameEnd: game.isGameEnd
    })
})

router.get('/game/restart', async (req, res) => {
    // удаление текущей игры из сессии
    req.session.game = null;
    // запускаем игру заново
    res.redirect('/game')
})

router.post('/game/action', (req, res) => {
    try {
        // из сессии бертся game
        const game = req.session.game
        if (!game) {
            return res.status(400).json({ success: false, message: 'Game not found' })
        }

        // из запроса берем action
        const { action } = req.body

        if (action === 'beaten') {
            // если "бито" - меняем isPlayerTurn на противположное
            game.isPlayerTurn = !game.isPlayerTurn
            req.session.game = game
            
            res.json({
                success: true,
                // отправляем актуальные isPlayerTurn и currentDeck
                isPlayerTurn: game.isPlayerTurn,
                currentDeck: game.currentDeck
            })
            return
        }
        res.json({
            success: true,
            isPlayerTurn: game.isPlayerTurn
        })

    } catch (error) {
        console.error('Failure with:', error)
        res.status(500).json({ success: false, message: 'SERVER ERROR' })
    }
})

router.post('/game/end', async (req, res) => {
    if (!req.session.login) { return res.status(400).json({ success: false, message: 'no login' })}

    try {
        await pool.updateEnds(req.session.login)
        res.json({ success: true })
    } catch (err) {
        console.error('Update ends failed with:', err)
        res.status(500).json({ success: false, message: 'DATABASE ERROR' })
    }
})

module.exports = router