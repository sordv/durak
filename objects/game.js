const { randomInt } = require('crypto');
const { allCards } = require('./card.js')

class Game {
    constructor() {
        this.currentDeck = this.randomizeDeck([...allCards])
        this.playerHand = []
        this.botHand = []
        this.trump = null
        this.isPlayerTurn = true
        this.getStartCards()
        this.createTrump()
    }

    randomizeDeck(oldDeck) {
        const newDeck = []
        while (oldDeck.length > 0) {
            const randomIndex = randomInt(0, oldDeck.length)
            newDeck.push(oldDeck.splice(randomIndex, 1)[0])
        }
        return newDeck
    }

    getStartCards() {
        this.playerHand = this.currentDeck.splice(0, 6)
        this.botHand = this.currentDeck.splice(0, 6)
    }

    createTrump() {
        const lastCard = this.currentDeck[this.currentDeck.length - 1]
        this.trump = lastCard.suit
    }
}

module.exports = Game

/*

*/
const game = new Game()

console.log("DECK:", game.currentDeck)
console.log("TRUMP:", game.trump)
console.log("PLAYER HAND:", game.playerHand)
console.log("BOT HAND:", game.botHand)
console.log("ALLCARDS: ", allCards)