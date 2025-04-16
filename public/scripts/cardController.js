document.addEventListener('DOMContentLoaded', () => {
    const tableArea = document.querySelector('.table-area')
    const playerCards = document.querySelector('.player-cards')
    const botCards = document.querySelector('.bot-cards')
    
    let { isPlayerTurn } = gameState
    
    function updateTurnIndicator() {
        const indicator = document.querySelector('.turn-indicator p')
        if (indicator) { indicator.textContent = isPlayerTurn ? 'нижний' : 'верхний' }
    }
    
    updateTurnIndicator()
    createNewSlot()
    
    function createNewSlot() {
        const slots = getSlots()
        if (slots.length >= 6) { return }
        
        const slot = document.createElement('div')
        slot.className = 'card-slot'
        slot.dataset.slotIndex = slots.length
        
        const attackSlot = document.createElement('div')
        attackSlot.className = 'attack-slot'
        attackSlot.dataset.type = 'attack'
        
        const defenseSlot = document.createElement('div')
        defenseSlot.className = 'defense-slot'
        defenseSlot.dataset.type = 'defense'
        
        slot.appendChild(attackSlot)
        slot.appendChild(defenseSlot)
        tableArea.appendChild(slot)
    }
    
    function getSlots() {
        return Array.from(document.querySelectorAll('.card-slot'))
    }
    
    function getTableCards() {
        const slots = getSlots()
        const cards = []
        
        slots.forEach(slot => {
            const attCard = slot.querySelector('.attack-slot img')
            const defCard = slot.querySelector('.defense-slot img')
            
            if (attCard) {
                cards.push({
                    type: 'attack',
                    element: attCard,
                    rank: attCard.dataset.rank,
                    suit: attCard.dataset.suit,
                    isTrump: attCard.dataset.isTrump === 'true',
                    power: attCard.dataset.power
                })
            }
            
            if (defCard) {
                cards.push({
                    type: 'defense',
                    element: defCard,
                    rank: defCard.dataset.rank,
                    suit: defCard.dataset.suit,
                    isTrump: defCard.dataset.isTrump === 'true',
                    power: defCard.dataset.power
                })
            }
        })
        return cards
    }
    
    function canAttackWithCard(card) {
        const tableCards = getTableCards()
        const cardRank = card.dataset.rank
        
        if (tableCards.length === 0) { return true }
        
        return tableCards.some(tableCard => tableCard.rank === cardRank)
    }
    
    function canDefendWithCard(defCard, attCard) {
        const defPower = defCard.dataset.power
        const attPower = attCard.dataset.power
        const defSuit = defCard.dataset.suit
        const attSuit = attCard.dataset.suit
        const defIsTrump = defCard.dataset.isTrump === 'true'
        const attIsTrump = attCard.dataset.isTrump === 'true'
        
        if (defIsTrump && !attIsTrump) { return true }
        
        if (!defIsTrump && attIsTrump) { return false }
        
        if (defIsTrump === attIsTrump) {
            if (!defIsTrump && defSuit !== attSuit) { return false }
            return defPower > attPower
        }
        return false
    }
    
    function handleAttack(card) {
        if (!canAttackWithCard(card)) { return }
        
        const slots = getSlots()

        const lastSlot = slots[slots.length - 1]
        const attSlot = lastSlot.querySelector('.attack-slot')
        
        if (attSlot.querySelector('img')) {
            if (slots.length < 6) {
                createNewSlot()
                handleAttack(card)
            }
            return
        }
        
        const cardCopy = card.cloneNode(true)
        cardCopy.classList.remove('jump-card', 'down-jump-card', 'dragging')
        attSlot.appendChild(cardCopy)
        card.remove()
        
        if (slots.length < 6) { createNewSlot() }
    }
    
    function handleDefense(card, targetSlot = null) {
        const slots = getSlots()
        let defSlot = null
        let attCardElement = null
        
        if (targetSlot) {
            const attackSlot = targetSlot.querySelector('.attack-slot')
            const defenseSlot = targetSlot.querySelector('.defense-slot')
            attCardElement = attackSlot.querySelector('img')
            
            if (attCardElement && !defenseSlot.querySelector('img')) {
                defSlot = defenseSlot
            }
        } else {
            for (const slot of slots) {
                const attackSlot = slot.querySelector('.attack-slot')
                const defenseSlot = slot.querySelector('.defense-slot')
                attCardElement = attackSlot.querySelector('img')
                
                if (attCardElement && !defenseSlot.querySelector('img')) {
                    defSlot = defenseSlot
                    break
                }
            }
        }
        
        if (!defSlot || !attCardElement) { return }
        
        if (!canDefendWithCard(card, attCardElement)) { return }
        
        const cardCopy = card.cloneNode(true)
        cardCopy.classList.remove('jump-card', 'down-jump-card', 'dragging')
        defSlot.appendChild(cardCopy)
        card.remove()
    }
    
    function findNearestDefenseSlot(x, y) {
        const slots = getSlots()
        let closestSlot = null
        let minDistance = Infinity
        
        for (const slot of slots) {
            const attSlot = slot.querySelector('.attack-slot')
            const defSlot = slot.querySelector('.defense-slot')
            
            if (attSlot.querySelector('img') && !defSlot.querySelector('img')) {
                const rect = slot.getBoundingClientRect()
                const slotCenterX = rect.left + rect.width / 2
                const slotCenterY = rect.top + rect.height / 2
                
                const distance = Math.sqrt(Math.pow(x - slotCenterX, 2) + Math.pow(y - slotCenterY, 2))
                
                if (distance < minDistance) {
                    minDistance = distance
                    closestSlot = slot
                }
            }
        }
        
        return closestSlot
    }
    
    function handleCardAction(card, event = null) {
        const isPlayerCard = card.parentElement === playerCards
        const isBotCard = card.parentElement === botCards
        
        if ((isPlayerTurn && isPlayerCard) || (!isPlayerTurn && isBotCard)) {
            handleAttack(card)
        } else if ((isPlayerTurn && isBotCard) || (!isPlayerTurn && isPlayerCard)) {
            if (event && event.type === 'drop') {
                const nearestSlot = findNearestDefenseSlot(event.clientX, event.clientY)
                if (nearestSlot) { handleDefense(card, nearestSlot) }
            } else { handleDefense(card) }
        }
    }
    
    function setupCardDrag(card) {
        card.draggable = true
        
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('card-id', card.dataset.cardId || '')
            e.dataTransfer.effectAllowed = 'move'
            card.classList.add('dragging')
        })
        
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging')
        })
    }
    
    function setupCardClick(card) {
        card.addEventListener('click', (e) => {
            if (e.target === card) {
                handleCardAction(card)
            }
        })
    }
    
    tableArea.addEventListener('dragover', (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    })
    
    tableArea.addEventListener('drop', (e) => {
        e.preventDefault()
        const draggedCard = document.querySelector('.dragging')
        if (draggedCard) {
            handleCardAction(draggedCard, e)
        }
    })
    
    document.querySelectorAll('.player-cards .card, .bot-cards .card').forEach(card => {
        const cardId = card.dataset.cardId
        const cardObj = [...gameState.playerHand, ...gameState.botHand].find(c => c.id === cardId)
        
        if (cardObj) {
            card.dataset.rank = cardObj.rank
            card.dataset.suit = cardObj.suit
            card.dataset.power = cardObj.power
            card.dataset.isTrump = cardObj.isTrump
        }
        
        setupCardDrag(card)
        setupCardClick(card)
    })
})