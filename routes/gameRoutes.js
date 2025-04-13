const express = require('express')
const router = express.Router()
const Game = require('../objects/game')

// GAME RENDER
router.get('/game', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login')
    }

    const game = req.session.game || new Game()
    req.session.game = game

    res.render('game', {
        currentDeck: game.currentDeck,
        playerHand: game.playerHand,
        botHand: game.botHand,
        trump: game.trump
    })
})

module.exports = router