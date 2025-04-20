// randomInt используется в растасовке колоды
const { randomInt } = require('crypto')
const { allCards } = require('./card.js')

class Game {
    constructor() {
        this.currentDeck = this.randomizeDeck([...allCards]) // текущая колода - копия базовой колоды
        this.playerHand = [] // рука нижнего игрока
        this.botHand = [] // рука верхнего игрока
        this.trump = null // тут определиться козырная масть
        this.isPlayerTurn = null // логическое значение: "ходит ли сейчас нижний игрок"
        this.createTrump() // определить козырь
        this.getStartCards() // раздать игрокам по 6 карт
        this.firstTurnOwner() // определить кто первый начнет ходить
    }

    randomizeDeck(oldDeck) {
        let newDeck = [] // итоговая колода
        // действительной колода станет если не будет 5-6 одинаковых мастей у кого-то из игроков на руке
        let isValidDeck = false
        const deck = [...oldDeck] // копия переданной колоды

        // колода будет растасовываться пока не станет действительной
        while (!isValidDeck) {
            const deckToShuffle = [...deck] // колода "донор" для растасовки
            newDeck = [] // обнуление итоговой колоды в начале новой попытки растасовать
            while (deckToShuffle.length > 0) {
                // берется рандомная карта в доноре и заносится в итоговую колоду
                const randomIndex = randomInt(0, deckToShuffle.length)
                newDeck.push(deckToShuffle.splice(randomIndex, 1)[0])
            }

            // выделяем две группы по 6 карт в начале итоговой колоды
            const forPlayer = newDeck.slice(0, 6)
            const forBot = newDeck.slice(6, 12)

            // если оба метода вернут false, значит карты растасованы удовлетворительно
            if (!this.hasTooMuchSameSuits(forPlayer) && !this.hasTooMuchSameSuits(forBot)) {
                isValidDeck = true
            }
        } 
        return newDeck
    }

    hasTooMuchSameSuits(cards) {
        // словарь { масть - количество }
        const suitCount = {}
        for (const card of cards) {
            // если нет записи о масти, то она создается со значением 0
            if (!suitCount[card.suit]) { suitCount[card.suit] = 0 }
            suitCount[card.suit] += 1
            if (suitCount[card.suit] >= 5) return true
        }
        // если возвращает false - значит карты растасованы хорошо
        return false
    }

    createTrump() {
        const lastCard = this.currentDeck[this.currentDeck.length - 1]
        this.trump = lastCard.suit
    }
    
    getStartCards() {
        // удаляем из текущей колоды первые 6 карт и отдаем их на руку
        this.playerHand = this.currentDeck.splice(0, 6)
        this.botHand = this.currentDeck.splice(0, 6)
        this.updateTrumpStatus() // поменяем поле isTrump картам
    }

    updateTrumpStatus() {
        // если card.suit равен this.trump, то card.isTrump будет true
        this.playerHand.forEach(card => { card.isTrump = card.suit === this.trump })
        this.botHand.forEach(card => { card.isTrump = card.suit === this.trump })
    }

    firstTurnOwner() {
        // находим все козыри у каждого игрока
        const playerTrumps = this.playerHand.filter(card => card.isTrump)
        const botTrumps = this.botHand.filter(card => card.isTrump)

        let minPlayerTrump = null
        let minBotTrump = null

        // если козыри есть - находим самый слабый
        if (playerTrumps.length > 0) { minPlayerTrump = this.getWeakestCard(playerTrumps) }
        if (botTrumps.length > 0) { minBotTrump = this.getWeakestCard(botTrumps) }

        // верхний игрок ходит если (у него меньший козырь) или (у него есть козырь, а у нижнего игрока нет)
        if ((!minPlayerTrump && minBotTrump) || 
            (minPlayerTrump && minBotTrump && minPlayerTrump.power > minBotTrump.power)) {
            this.isPlayerTurn = false
        } else { this.isPlayerTurn = true }
    }

    getWeakestCard(cards) {
        if (cards.length === 0) return null
        
        let weakestCard = cards[0]
        for (let i = 1; i < cards.length; i++) {
            // "слабость" карты оценивается по полю power
            if (cards[i].power < weakestCard.power) { weakestCard = cards[i] }
        }
        return weakestCard
    }
}

module.exports = Game