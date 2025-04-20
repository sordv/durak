class Card {
    constructor(suit, rank, power) {
        this.suit = suit // масть карты
        this.rank = rank // значение карты
        this.power = power // сила карты (для сравнения)
        this.isTrump = false // является ли козырем (устанавливается нужным картам во время раздачи)
        this.skin = `icons/cards/${suit}_${rank}.png` // динамический поиск изображения в папке
    }
}

// В названии карт первая буква масти + значение
// Hearts - Черви
// Diamonds - Буби
// Clubs - Крести
// Spades - Пики

const card_H6 = new Card('Hearts', '6', 1)
const card_H7 = new Card('Hearts', '7', 2)
const card_H8 = new Card('Hearts', '8', 3)
const card_H9 = new Card('Hearts', '9', 4)
const card_H10 = new Card('Hearts', '10', 5)
const card_HJ = new Card('Hearts', 'J', 6)
const card_HQ = new Card('Hearts', 'Q', 7)
const card_HK = new Card('Hearts', 'K', 8)
const card_HA = new Card('Hearts', 'A', 9)

const card_D6 = new Card('Diamonds', '6', 1)
const card_D7 = new Card('Diamonds', '7', 2)
const card_D8 = new Card('Diamonds', '8', 3)
const card_D9 = new Card('Diamonds', '9', 4)
const card_D10 = new Card('Diamonds', '10', 5)
const card_DJ = new Card('Diamonds', 'J', 6)
const card_DQ = new Card('Diamonds', 'Q', 7)
const card_DK = new Card('Diamonds', 'K', 8)
const card_DA = new Card('Diamonds', 'A', 9)

const card_C6 = new Card('Clubs', '6', 1)
const card_C7 = new Card('Clubs', '7', 2)
const card_C8 = new Card('Clubs', '8', 3)
const card_C9 = new Card('Clubs', '9', 4)
const card_C10 = new Card('Clubs', '10', 5)
const card_CJ = new Card('Clubs', 'J', 6)
const card_CQ = new Card('Clubs', 'Q', 7)
const card_CK = new Card('Clubs', 'K', 8)
const card_CA = new Card('Clubs', 'A', 9)

const card_S6 = new Card('Spades', '6', 1)
const card_S7 = new Card('Spades', '7', 2)
const card_S8 = new Card('Spades', '8', 3)
const card_S9 = new Card('Spades', '9', 4)
const card_S10 = new Card('Spades', '10', 5)
const card_SJ = new Card('Spades', 'J', 6)
const card_SQ = new Card('Spades', 'Q', 7)
const card_SK = new Card('Spades', 'K', 8)
const card_SA = new Card('Spades', 'A', 9)

// создание и экспорт базовой колоды
const allCards = [
    card_H6, card_H7, card_H8, card_H9, card_H10, card_HJ, card_HQ, card_HK, card_HA,
    card_D6, card_D7, card_D8, card_D9, card_D10, card_DJ, card_DQ, card_DK, card_DA,
    card_C6, card_C7, card_C8, card_C9, card_C10, card_CJ, card_CQ, card_CK, card_CA,
    card_S6, card_S7, card_S8, card_S9, card_S10, card_SJ, card_SQ, card_SK, card_SA
]

module.exports = { allCards }