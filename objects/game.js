const { randomInt } = require('crypto')
const { allCards } = require('./card.js')

class Game {
    constructor() {
        this.currentDeck = this.randomizeDeck([...allCards])
        this.playerHand = []
        this.botHand = []
        this.trump = null
        this.isPlayerTurn = null
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
            if (!suitCount[card.suit]) { suitCount[card.suit] = 0 }
            suitCount[card.suit] += 1
            if (suitCount[card.suit] >= 5) return true
        }
        return false
    }

    createTrump() {
        const lastCard = this.currentDeck[this.currentDeck.length - 1]
        this.trump = lastCard.suit
        for (const card of this.currentDeck) {
            if (card.suit === this.trump) { card.isTrump = true }
        }
        this.playerHand.forEach(card => { card.isTrump = card.suit === this.trump })
        this.botHand.forEach(card => { card.isTrump = card.suit === this.trump })
    }
    
    getStartCards() {
        this.playerHand = this.currentDeck.splice(0, 6)
        this.botHand = this.currentDeck.splice(0, 6)
    }

    firstTurnOwner() {
        const playerTrumps = this.playerHand.filter(card => card.isTrump)
        const botTrumps = this.botHand.filter(card => card.isTrump)

        let minPlayerTrump = null
        if (playerTrumps.length > 0) { minPlayerTrump = this.getWeakestCard(playerTrumps) }

        let minBotTrump = null
        if (botTrumps.length > 0) { minBotTrump = this.getWeakestCard(botTrumps) }

        if ((!minPlayerTrump && minBotTrump) || 
            (minPlayerTrump && minBotTrump && minPlayerTrump.power > minBotTrump.power)) {
            this.isPlayerTurn = false
        } else { this.isPlayerTurn = true }
    }

    getWeakestCard(cards) {
        if (cards.length === 0) return null
        
        let weakestCard = cards[0]
        for (let i = 1; i < cards.length; i++) {
            if (cards[i].power < weakestCard.power) { weakestCard = cards[i] }
        }
        return weakestCard
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