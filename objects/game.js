const { randomInt } = require('crypto');
const { allCards } = require('./card.js');
const { monitorEventLoopDelay } = require('perf_hooks');

class Game {
    constructor() {
        this.currentDeck = this.randomizeDeck([...allCards])
        this.playerHand = []
        this.botHand = []
        this.trump = null
        this.isPlayerTurn = true
        this.attackZone = []
        this.defenseZone = []
        this.getStartCards()
        this.createTrump()
        this.firstTurnOwner()
    }

    randomizeDeck(oldDeck) {
        let newDeck = []
        let isValidDeck = false
        const deck = [...oldDeck]

        while (!isValidDeck) {
            const deckToShuffle = [...deck]
            newDeck = []
            while (deckToShuffle.length > 0) {
                const randomIndex = randomInt(0, deckToShuffle.length)
                newDeck.push(deckToShuffle.splice(randomIndex, 1)[0])
            }

            const forPlayer = newDeck.slice(0, 6)
            const forBot = newDeck.slice(6, 12)

            if (!this.hasTooMuchSameSuits(forPlayer) && !this.hasTooMuchSameSuits(forBot)) {
                isValidDeck = true
            }
        }
        
        return newDeck
    }

    hasTooMuchSameSuits(cards) {
        const suitCount = {}
        for (const card of cards) {
            suitCount[card.suit] = (suitCount[card.suit] || 0) + 1
            if (suitCount[card.suit] >= 5) return true
        }
        return false
    }

    getStartCards() {
        this.playerHand = this.currentDeck.splice(0, 6)
        this.botHand = this.currentDeck.splice(0, 6)
    }

    createTrump() {
        const lastCard = this.currentDeck[this.currentDeck.length - 1]
        this.trump = lastCard.suit
    }

    firstTurnOwner() {
        const lowestPlayerTrump = this.getLowestTrump(this.playerHand)
        const lowestBotTrump = this.getLowestTrump(this.botHand)

        if ((!lowestPlayerTrump && lowestBotTrump) || 
        (lowestPlayerTrump && lowestBotTrump && lowestPlayerTrump.rank > lowestBotTrump.rank)) {
            this.isPlayerTurn = false
        } else { this.isPlayerTurn = true }
    }

    getLowestTrump(hand) {
        let lowestTrump = null;
        
        for (const card of hand) {
            if (card.suit === this.trump) {
                if (!lowestTrump || parseInt(card.id) < parseInt(lowestTrump.id)) {
                    lowestTrump = card;
                }
            }
        }
        
        return lowestTrump;
    }
}

module.exports = Game

/*
const game = new Game()

console.log("DECK:", game.currentDeck)
console.log("TRUMP:", game.trump)
console.log("PLAYER HAND:", game.playerHand)
console.log("BOT HAND:", game.botHand)
console.log("ALLCARDS: ", allCards)
*/
