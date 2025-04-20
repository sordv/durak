const express = require('express')
const router = express.Router()
const Game = require('../objects/game')

// middleware чтобы использовать json объекты
router.use((req, res, next) => {
    res.locals.json = obj => JSON.stringify(obj).replace(/<\/script>/g, '<\\/script>') // еще какая-то безопасность
    next()
})

// отображение страницы game.hbs
router.get('/game', (req, res) => {
    // если сессия не имеет userId (вход не выполнен), то откроется страница login
    if (!req.session.userId) { return res.redirect('/login') }

    // из сессии достается game если есть, если нет, то создается
    const game = req.session.game || new Game()
    req.session.game = game

    // достаются значение из текущего объекта game чтоб передать game.hbs
    res.render('game', {
        currentDeck: game.currentDeck,
        playerHand: game.playerHand,
        botHand: game.botHand,
        trump: game.trump,
        isPlayerTurn: game.isPlayerTurn
    })
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

module.exports = router