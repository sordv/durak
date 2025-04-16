class Card{
    constructor(id, suit, rank, power) {
        this.id = id
        this.suit = suit
        this.rank = rank
        this.power = power
        this.isTrump = false
        this.skin = `icons/cards/${suit}_${rank}.png`
    }
}

const card_H6 = new Card('01', 'Hearts', '6', 1)
const card_H7 = new Card('02', 'Hearts', '7', 2)
const card_H8 = new Card('03', 'Hearts', '8', 3)
const card_H9 = new Card('04', 'Hearts', '9', 4)
const card_H10 = new Card('05', 'Hearts', '10', 5)
const card_HJ = new Card('06', 'Hearts', 'J', 6)
const card_HQ = new Card('07', 'Hearts', 'Q', 7)
const card_HK = new Card('08', 'Hearts', 'K', 8)
const card_HA = new Card('09', 'Hearts', 'A', 9)

const card_D6 = new Card('11', 'Diamonds', '6', 1)
const card_D7 = new Card('12', 'Diamonds', '7', 2)
const card_D8 = new Card('13', 'Diamonds', '8', 3)
const card_D9 = new Card('14', 'Diamonds', '9', 4)
const card_D10 = new Card('15', 'Diamonds', '10', 5)
const card_DJ = new Card('16', 'Diamonds', 'J', 6)
const card_DQ = new Card('17', 'Diamonds', 'Q', 7)
const card_DK = new Card('18', 'Diamonds', 'K', 8)
const card_DA = new Card('19', 'Diamonds', 'A', 9)

const card_C6 = new Card('21', 'Clubs', '6', 1)
const card_C7 = new Card('22', 'Clubs', '7', 2)
const card_C8 = new Card('23', 'Clubs', '8', 3)
const card_C9 = new Card('24', 'Clubs', '9', 4)
const card_C10 = new Card('25', 'Clubs', '10', 5)
const card_CJ = new Card('26', 'Clubs', 'J', 6)
const card_CQ = new Card('27', 'Clubs', 'Q', 7)
const card_CK = new Card('28', 'Clubs', 'K', 8)
const card_CA = new Card('29', 'Clubs', 'A', 9)

const card_S6 = new Card('31', 'Spades', '6', 1)
const card_S7 = new Card('32', 'Spades', '7', 2)
const card_S8 = new Card('33', 'Spades', '8', 3)
const card_S9 = new Card('34', 'Spades', '9', 4)
const card_S10 = new Card('35', 'Spades', '10', 5)
const card_SJ = new Card('36', 'Spades', 'J', 6)
const card_SQ = new Card('37', 'Spades', 'Q', 7)
const card_SK = new Card('38', 'Spades', 'K', 8)
const card_SA = new Card('39', 'Spades', 'A', 9)

const allCards = [
    card_H6, card_H7, card_H8, card_H9, card_H10, card_HJ, card_HQ, card_HK, card_HA,
    card_D6, card_D7, card_D8, card_D9, card_D10, card_DJ, card_DQ, card_DK, card_DA,
    card_C6, card_C7, card_C8, card_C9, card_C10, card_CJ, card_CQ, card_CK, card_CA,
    card_S6, card_S7, card_S8, card_S9, card_S10, card_SJ, card_SQ, card_SK, card_SA
]

module.exports = { allCards }