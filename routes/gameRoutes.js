const express = require('express')
const router = express.Router()
const Game = require('../objects/game')

//helper
router.use((req, res, next) => {
    res.locals.json = obj => JSON.stringify(obj).replace(/<\/script>/g, '<\\/script>')
    next()
})

// GAME RENDER
router.get('/game', (req, res) => {
    // check authorization
    if (!req.session.userId) { return res.redirect('/login') }

    // load or create a game
    const game = req.session.game || new Game()
    req.session.game = game

    // game render
    res.render('game', {
        currentDeck: game.currentDeck,
        playerHand: game.playerHand,
        botHand: game.botHand,
        trump: game.trump,
        isPlayerTurn: game.isPlayerTurn
    })
})

module.exports = router