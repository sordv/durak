document.addEventListener('DOMContentLoaded', () => {
    // получение элементов для перемещения карт и обновления deck-area
    const tableArea = document.querySelector('.table-area')
    const playerArea = document.querySelector('.player-area')
    const botArea = document.querySelector('.bot-area')
    const playerCards = document.querySelector('.player-cards')
    const botCards = document.querySelector('.bot-cards')
    const turnIndicator = document.querySelector('.turn-indicator p')
    const deckCountElement = document.querySelector('.deck-count')
    const deckArea = document.querySelector('.deck-area')
    const showing1Elements = deckArea?.querySelectorAll('.showing1') || []
    const showing2Elements = deckArea?.querySelectorAll('.showing2') || []
    
    // флаг "нажал ли игрок кнопку "взять""
    let takeButtonClicked = false
    let isProcessingAction = false
    let isGameEnd = false
    
    // запуск скрипта
    initGameController()
    
    function initGameController() {
        // если не нашелся объект с данными игры
        if (!window.gameData) {
            console.error('gameData not initialized')
            return
        }
        
        updateDeckArea() // обновляем состояние deck-area
        setupTableObserver() // создаем наблюдатель за столом
        setupCardInteractions() // "настройка" выданных карт
        updateTurnIndicator() // обновление индикатора того, чей ход
        resetTableSlots(true) // обновление состояния карточных слотов в table-area
        updateActionButtons() // обновление состояний кнопок действий
        updateDeckCount() // обновление счетчика оставшихся в колоде карт
    }

    // функция для обновления отображения deck-area
    function updateDeckArea() {
        // если есть объект с данными игры, а в нем текущая колода
        const deckLength = window.gameData?.currentDeck?.length || 0
        
        if (deckLength > 0) {
            showing1Elements.forEach(i => i.style.display = 'block') // отобразить
            showing2Elements.forEach(i => i.style.display = 'none') // скрыть
        } else {
            showing1Elements.forEach(i => i.style.display = 'none') // скрыть
            showing2Elements.forEach(i => i.style.display = 'block') // отобразить
        }
    }

    // обновление числа оставшихся в колоде карт
    function updateDeckCount() {
        // если существует (элемент для отображения числа карт в разметке) и (текущая колода в данных игры)
        if (deckCountElement && window.gameData?.currentDeck) {
            // значение элемента разметке = длина текущей колоды в игре
            deckCountElement.textContent = window.gameData.currentDeck.length
            // обновление состояния deck-area
            updateDeckArea()
        }
    }
    
    // обновление переменной isPlayerTurn
    function getCurrentTurn() {
        // возвращается значение isPlayerTurn из данных текущей игры (иначе true)
        return window.gameData?.isPlayerTurn ?? true
    }
    
    // обновление индикатора владельца хода
    function updateTurnIndicator() {
        const indicator = document.getElementById('turnIndicator')
        if (indicator) {
            indicator.className = getCurrentTurn() ? 
                'turn-indicator player-turn' : 
                'turn-indicator bot-turn'
        }
    }
    
    // добавление игрокам карт из колоды
    function dealCards() {
        // проверка колоды на наличие карт
        if (window.gameData.currentDeck.length === 0) {
            console.log('Current deck is empty')
            return
        }
        
        // сначала добавляются карты тому, кто атаковал, а потом тому, кто защищался
        // если GetCurrentTurn возвращает True, значит атаковал нижний игрок
        dealCardsToPlayer(getCurrentTurn() ? 'player' : 'bot')
        dealCardsToPlayer(getCurrentTurn() ? 'bot' : 'player')
        // после начисления обновляем счетчик
        updateDeckCount()
        // "настройка" выданных карт
        setupCardInteractions()
        // обновляем состояние deck-area
        updateDeckArea()
    }
    
    // добавление карт из колоды конкретному игроку
    function dealCardsToPlayer(player) {
        // определение того к какой руке нужно добавить карты
        const targetHand = player === 'player' ? playerCards : botCards
        // удалить
        const handKey = player === 'player' ? 'playerHand' : 'botHand'
        // сколько карт нужно добавить?
        // если на руке находится больше 6 карт, то выражение 6 - кол-во карт вернет отрицательное число
        // в таком случае добавлять ничего не нужно, поэтому тут max(0, положительно число)
        const cardsNeeded = Math.max(0, 6 - targetHand.children.length)
        // сколько карт сможем добавить?
        // выбирая из (сколько карт НУЖНО) и (кол-во карт в колоде) сможем взять только наименьшее
        // удаляем карту из текущей колоды и добавляем в cardsToAdd
        const cardsToAdd = window.gameData.currentDeck.splice(0, Math.min(cardsNeeded, window.gameData.currentDeck.length))
        
        cardsToAdd.forEach(card => {
            // создаем карту
            const cardElement = document.createElement('img')
            cardElement.src = card.skin
            // если карта у нижнего игрока - класс jump-card, иначе down-jump-card
            cardElement.className = `card ${player === 'player' ? 'jump-card' : 'down-jump-card'}`
            cardElement.alt = `${card.suit} ${card.rank}`
            cardElement.dataset.suit = card.suit
            cardElement.dataset.rank = card.rank
            cardElement.dataset.power = card.power
            cardElement.dataset.isTrump = card.isTrump
            // добавляем к руке
            targetHand.appendChild(cardElement)
        })
        updateDeckCount()
        updateDeckArea()
    }
    
    // настройка карт
    function setupCardInteractions() {
        // метод не выполняется если игра закончилась
        if (isGameEnd) { return }
        try {
            // клонирование каждой карты для сброса старых event listeners
            document.querySelectorAll('.player-cards .card, .bot-cards .card').forEach(card => {
                card.replaceWith(card.cloneNode(true))
            })
            // настройка каждой карты
            document.querySelectorAll('.player-cards .card, .bot-cards .card').forEach(card => {
                setupSingleCard(card)
            })
            // настройка обработчкиков игровой зоны
            setupTableEventListeners()
        } catch (error) { console.error('Error setupCardInteractions with:', error) }
    }
    
    // настройка отдельной карты
    function setupSingleCard(card) {
        const suit = card.dataset.suit
        const rank = card.dataset.rank
        const cardObj = [...window.gameData.playerHand, ...window.gameData.botHand]
            .find(c => c.suit === suit && c.rank === rank)
        // обновляем значение козыря
        if (cardObj) {
            // удалить
            card.dataset.power = cardObj.power
            card.dataset.isTrump = cardObj.isTrump
        }
        // настройка взаимодействия с картой
        setupCardDrag(card)
        setupCardClick(card)
    }
    
    // настройка обработчиков игровой зоны для скидывания карт
    function setupTableEventListeners() {
        tableArea.addEventListener('dragover', (e) => {
            e.preventDefault()
            if (e.dataTransfer) { e.dataTransfer.dropEffect = 'move' }
        })

        tableArea.addEventListener('drop', (e) => {
            e.preventDefault()
            const draggedCard = document.querySelector('.dragging')
            if (draggedCard && !isProcessingAction) {
                isProcessingAction = true
                handleCardAction(draggedCard, e)
                isProcessingAction = false
            }
        })
    }
    
    // перетаскивание карт в игровую зону
    function setupCardDrag(card) {
        card.draggable = true
        // начало перетаскивания
        card.addEventListener('dragstart', (e) => {
            if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move' }
            card.classList.add('dragging') // даем метку активного перетаскивания
        })
        // конец перетаскивания
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging') // снимаем эту метку
        })
    }
    
    // клик на карту для скидывания в игровую зону
    function setupCardClick(card) {
        card.addEventListener('click', (e) => {
            if (e.target === card && !isProcessingAction) {
                isProcessingAction = true
                handleCardAction(card)
                isProcessingAction = false
            }
        })
    }
    
    // сыграть карту
    function handleCardAction(card, event = null) {
        const currentTurn = getCurrentTurn() // определяем владельца хода
        const isPlayerCard = card.parentElement === playerCards // определяем принадлежит ли карта нижнему игроку
        const isBotCard = card.parentElement === botCards // определяем принадлежит ли карта верхнему игроку
        // происходит защитное действие ?
        const isDefenseAction = (currentTurn && isBotCard) || (!currentTurn && isPlayerCard)
        
        if (isDefenseAction) {
            // если во время защиты происходит перетаскивание карты (а не клик)
            if (event && event.type === 'drop') {
                // находим ближайший слот куда можно скинуть защитную карту
                const nearestSlot = findNearestDefenseSlot(event.clientX, event.clientY)
                // если нашелся (а он должен найтись), то играем как защитную карту
                if (nearestSlot) { handleDefense(card, nearestSlot) }
            } else { 
                // если карта не перетаскивается, а кликается, то просто играем карту как защитную (на первую не отбитую карту)
                handleDefense(card)
            }
        } else {
            // если действие не защитное, а атакующее, то играем как атакующую карту
            handleAttack(card)
        }
    }
    
    // сыграть карту как атакующую
    function handleAttack(card) {
        // метод не выполняется если игра закончилась
        if (isGameEnd) { return }
        const currentTurn = getCurrentTurn() // определяем владельца хода
        const isPlayerCard = card.parentElement === playerCards // определяем принадлежность карты к нижнему игроку
        // если карту пытаются сыграть не в свой ход
        if ((currentTurn && !isPlayerCard) || (!currentTurn && isPlayerCard)) {
            console.error('Сейчас не ваш ход для атаки')
            return
        }
        // если пытаются подбросить карту, которую подбросить нельзя
        if (!canAttackWithCard(card)) { 
            console.error('Нельзя атаковать этой картой')
            return
        }
        // получаем свободный слот под атакующую карту (последний)
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
        
        // определяем того, кто атаковал
        const handKey = isPlayerCard ? 'playerHand' : 'botHand'
        // определяем индекс карты, которой сходили
        const cardIndex = window.gameData[handKey].findIndex(c => 
            c.suit === card.dataset.suit && c.rank === card.dataset.rank
        )
        // удаляем карту из руки сходившего
        if (cardIndex !== -1) { window.gameData[handKey].splice(cardIndex, 1) }
        
        // переносим карту на стол
        card.remove()
        const cardCopy = card.cloneNode(true)
        cardCopy.classList.remove('jump-card', 'down-jump-card', 'dragging')
        attSlot.appendChild(cardCopy)
        
        // создаем карточный слот если их еще не 6
        if (slots.length < 6) { createNewSlot() }

        // если у игрока не осталось больше карт, то вызовем проверку конца игры
        if (window.gameData[handKey].length === 0) { if (checkGameEnd()) return }
    }
    
    // сыграть карту как защищающую
    function handleDefense(card, targetSlot = null) {
        // метод не выполняется если игра закончилась
        if (isGameEnd) { return }
        const slots = getSlots()
        let defSlot = null
        let attCardElement = null
        // если слот выбран при перетаскивании
        if (targetSlot) {
            const attackSlot = targetSlot.querySelector('.attack-slot')
            const defenseSlot = targetSlot.querySelector('.defense-slot')
            attCardElement = attackSlot.querySelector('img')
            // если слот сущесствует и содержит только атакующую карту
            if (attCardElement && !defenseSlot.querySelector('img')) {
                // выбираем этот слот
                defSlot = defenseSlot
            }
        } else {
            // проверяем все слоты по порядку
            for (const slot of slots) {
                const attackSlot = slot.querySelector('.attack-slot')
                const defenseSlot = slot.querySelector('.defense-slot')
                attCardElement = attackSlot.querySelector('img')
                // если нашли слот где не отбита атакующая карта
                if (attCardElement && !defenseSlot.querySelector('img')) {
                    // выбираем этот слот
                    defSlot = defenseSlot
                    break
                }
            }
        }
        // если не нашли подходящий слот
        if (!defSlot || !attCardElement) { return }
        // если не можем сыграть карту как защищающую...
        if (!canDefendWithCard(card, attCardElement)) { 
            console.error('Нельзя защищаться этой картой')
            return
        }
        // ...если можем сыграть, то удаляем ее из руки...
        const handKey = card.parentElement === playerCards ? 'playerHand' : 'botHand'
        const cardIndex = window.gameData[handKey].findIndex(c => 
            c.suit === card.dataset.suit && c.rank === card.dataset.rank
        )
        if (cardIndex !== -1) { window.gameData[handKey].splice(cardIndex, 1) }
        // ...и добавляем на стол
        card.remove()
        const cardCopy = card.cloneNode(true)
        cardCopy.classList.remove('jump-card', 'down-jump-card', 'dragging')
        defSlot.appendChild(cardCopy)

        // если у игрока не осталось больше карт, то вызовем проверку конца игры
        if (window.gameData[handKey].length === 0) { if (checkGameEnd()) return }
    }
    
    // проверяем закончилась ли игра
    function checkGameEnd() {
        // узнаем пустые ли руки у игроков
        const emptyPlayerHand = playerCards.children.length === 0
        const emptyBotHand = botCards.children.length === 0
        // если одна из рук пуста и в колоде больше нет карт, то игра кончилась
        if ((emptyPlayerHand || emptyBotHand) && window.gameData.currentDeck.length === 0) {
            // победитель тот, у кого пустая рука
            // не предусмотрена возможность ничьи
            // по механике ходьбы картами одномоментно две руки пустыми оказатся не могут
            const winner = emptyPlayerHand ? 'player' : 'bot'
            isGameEnd = true
            window.gameData.isGameEnd = true
            // обработка завершения игры
            handleGameEnd(winner)
            return true
        }
        return false
    }

    // обработка завершения игры
    function handleGameEnd(winner) {
        // запрос о завершении игры
        // Отправляем запрос на сервер о завершении игры
        fetch('/game/end', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ winner: winner })
        }).catch(err => console.error('req update ends failed with:', err))

        // скрываем кнопку выхода из игры
        document.querySelector('.button-icon-delete').style.display = 'none'
        // скрываем кнопки действий
        document.querySelectorAll('.action-button').forEach(btn => btn.remove())
        // выключаем действия с картами
        document.querySelectorAll('.card').forEach(card => {
            card.draggable = false;
            card.style.pointerEvents = 'none';
            card.style.opacity = '0.7';
        })
        // очищаем игровую зону
        tableArea.innerHTML = ''
        // создаем сообщение о конце игры
        const endGameMessage = document.querySelector('.end-game-message')
        const winnerNameElement = endGameMessage.querySelector('.winner-name')
        winnerNameElement.textContent = winner === 'player' ? 'НИЖНИЙ ИГРОК' : 'ВЕРХНИЙ ИГРОК'

        document.getElementById('restart-button').addEventListener('click', () => {
            window.location.href = '/game/restart'
        })
    
        document.getElementById('menu-button').addEventListener('click', () => {
            window.location.href = '/'
        })
    
        // Показываем сообщение
        endGameMessage.style.display = 'block'
    }

    // получаем все слоты под карты на столе
    function getSlots() {
        return Array.from(document.querySelectorAll('.card-slot'))
    }
    
    // получаем все карты на столе
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
                    power: parseInt(attCard.dataset.power) || 0
                })
            }
            
            if (defCard) {
                cards.push({
                    type: 'defense',
                    element: defCard,
                    rank: defCard.dataset.rank,
                    suit: defCard.dataset.suit,
                    isTrump: defCard.dataset.isTrump === 'true',
                    power: parseInt(defCard.dataset.power) || 0
                })
            }
        })
        return cards
    }
    
    // можем ли сыграть как атакующую карту?
    function canAttackWithCard(card) {
        // получаем значения всех карт на столе
        const tableCards = getTableCards()
        const cardRank = card.dataset.rank
        // если на столе нет карт, то можем в любом случае
        if (tableCards.length === 0) { return true }
        // иначи только если значение card совпадает с одним из значений на столе
        return tableCards.some(tableCard => tableCard.rank === cardRank)
    }
    
    // можем ли сыграть как защищающую карту?
    function canDefendWithCard(defCard, attCard) {
        // находим значения силы и масти для каждой из карт.
        const defPower = parseInt(defCard.dataset.power) || 0
        const attPower = parseInt(attCard.dataset.power) || 0
        const defSuit = defCard.dataset.suit
        const attSuit = attCard.dataset.suit
        // определяем является ли одна из карт козырной
        const defIsTrump = defCard.dataset.suit === window.gameData.trumpSuit
        const attIsTrump = attCard.dataset.suit === window.gameData.trumpSuit
    
        // защита - козырь, атака - НЕ козырь
        if (defIsTrump && !attIsTrump) { return true }
        // защита - НЕ козырь, атака - козырь
        if (!defIsTrump && attIsTrump) { return false }
        // масти карт не совпадают, защита - НЕ козырь
        if (defSuit !== attSuit && !defIsTrump) { return false }
        // остальные случаи (масти совпадают)
        return defPower > attPower
    }
    
    // поиск ближайшего карточного слота к курсору
    function findNearestDefenseSlot(x, y) {
        const slots = getSlots()
        let closestSlot = null
        let minDistance = Infinity
        
        for (const slot of slots) {
            const attSlot = slot.querySelector('.attack-slot')
            const defSlot = slot.querySelector('.defense-slot')
            // проверяем только те слоты, в которых есть атакующая карта, но нет защищающей
            if (attSlot.querySelector('img') && !defSlot.querySelector('img')) {
                // находим центр слота
                const rect = slot.getBoundingClientRect()
                const slotCenterX = rect.left + rect.width / 2
                const slotCenterY = rect.top + rect.height / 2
                // вычисление расстояния
                const distance = Math.sqrt(
                    Math.pow(x - slotCenterX, 2) + Math.pow(y - slotCenterY, 2)
                )
                // если слот оказался ближе остальных, сохраняем слот и расстояние до него
                if (distance < minDistance) {
                    minDistance = distance
                    closestSlot = slot
                }
            }
        }
        return closestSlot
    }
    
    // наблюдение за изменениями на столе
    function setupTableObserver() {
        // создаем наблюдатель
        const tableObserver = new MutationObserver(() => { updateActionButtons() })
        tableObserver.observe(tableArea, {
            childList: true,
            subtree: true
        })
    }
    
    // сброс карточных слотов
    function resetTableSlots(fullReset = false) {
        // удаляем все слоты
        if (fullReset) { tableArea.innerHTML = '' }
        else {
            // очищаем каждый слот
            document.querySelectorAll('.attack-slot, .defense-slot').forEach(slot => {
                slot.innerHTML = ''
            })
        }
        // создаем новый слот
        createNewSlot()
    }
    
    // создание нового карточного слота
    function createNewSlot() {
        // если количество слотов равно 6, то метод ничего не сделает
        const slots = getSlots()
        if (slots.length >= 6) { return }
        // создание слота
        const slot = document.createElement('div')
        slot.className = 'card-slot'
        slot.dataset.slotIndex = slots.length
        // создание места под атакующую карту
        const attackSlot = document.createElement('div')
        attackSlot.className = 'attack-slot'
        attackSlot.dataset.type = 'attack'
        // создание места под защищающую карту
        const defenseSlot = document.createElement('div')
        defenseSlot.className = 'defense-slot'
        defenseSlot.dataset.type = 'defense'
        // добавление стола в div table-area на разметку страницы с игрой
        slot.appendChild(attackSlot)
        slot.appendChild(defenseSlot)
        tableArea.appendChild(slot)
    }
    
    // обновление состояний кнопок действий
    function updateActionButtons() {
        // удаляем все существующие кнопки
        document.querySelectorAll('.action-button').forEach(btn => btn.remove())
        // получаем все слоты на столе
        const slots = Array.from(document.querySelectorAll('.card-slot'))
        // определяем есть ли хотя бы 1 карта на столе
        const hasCardsOnTable = slots.some(slot => 
            slot.querySelector('.attack-slot img') !== null
        )
        
        if (hasCardsOnTable) {
            // проверяет в каждом ли слоте атакующая карта отбита защищающей
            const allCovered = slots.every(slot => {
                const attack = slot.querySelector('.attack-slot img')
                const defense = slot.querySelector('.defense-slot img')
                return !attack || (attack && defense)
            })
            // если все карты покрыты, создается кнопка "бито"
            if (allCovered) {
                createActionButton(
                    window.gameData.isPlayerTurn ? 'player' : 'bot', // появится только у атакующего
                    'beaten', // тип
                    'БИТО', // текст
                    handleBeatenClick // результат нажатия на кнопку
                )
            }
            // проверят есть ли хотя бы одна не отбитая карта
            const hasUncovered = slots.some(slot => {
                return slot.querySelector('.attack-slot img') && 
                       !slot.querySelector('.defense-slot img')
            })
            // если есть не отбитые карты, создается кнопка "Взять"
            if (hasUncovered) {
                createActionButton(
                    window.gameData.isPlayerTurn ? 'bot' : 'player', // появится только у защищающегося
                    'take', // тип
                    'ВЗЯТЬ', // текст
                    handleTakeClick // результат нажатия на кнопку
                )
            }
            // если кнопка "Взять" нажата, создается кнопка "Пас"
            if (takeButtonClicked) {
                createActionButton(
                    window.gameData.isPlayerTurn ? 'player' : 'bot', // появится только у атакующего
                    'pass', // тип
                    'ПАС', // текст
                    handlePassClick // результат нажатия на кнопку
                )
            }
        }
    }
    
    // создание кнопки действия
    function createActionButton(player, type, text, handler) {
        const button = document.createElement('button')
        button.className = `action-button ${type}-button` // используется для задания стилей
        button.textContent = text // используется для отображения на кнопке
        button.addEventListener('click', handler) // результат клика по кнопке
        // определяет игрока, которому нужно добавить кнопку действия
        const area = player === 'player' ? playerArea : botArea
        area.appendChild(button)
    }
    
    // нажатие на кнопку "бито"
    function handleBeatenClick() {
        if (isProcessingAction) return // закончит метод если уже активно
        isProcessingAction = true // начало операции
        // отправление действия на сервер
        fetch('/game/action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'beaten' })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.gameData.isPlayerTurn = data.isPlayerTurn
                clearTable() // очищаем стол
                updateTurnIndicator() // обновляем индикатор владельца хода
                takeButtonClicked = false // снимаем флаг с кнопки "взять"
                dealCards() // добираем карты
                resetTableSlots(true) // удаляет карты из слотов
                updateActionButtons() // обновляем состояние кнопок действия
                setupCardInteractions() // настраиваем выданные карты
            }
        })
        .catch(error => { console.error('Error in handleBeatenClick with:', error) })
        .finally(() => { isProcessingAction = false }) // конец операции
    }
    
    // нажатие на кнопку "пас"
    function handlePassClick() {
        if (isProcessingAction) return // закончит метод если уже активно
        isProcessingAction = true // начало операции
        
        enableCards() // включаем игроку карты
        moveCardsToDefender() // передать карты защищающемуся игроку
        takeButtonClicked = false // снимаем флаг с кнопки "взять"
        dealCards() // раздать карты из колоды
        resetTableSlots(true) // очищаем слоты
        updateActionButtons() // обновляем состояние кнопок действий
        setupCardInteractions() // настроить выданные карты
        
        isProcessingAction = false // конец операции
    }
    
    // нажатие на кнопку "взять"
    function handleTakeClick() {
        takeButtonClicked = true // поставить флаг на кнопку
        disableCards() // отключаем карты игроку
        updateActionButtons() // обновить состояние кнопок действий
    }
    
    // делаем карты текущего игрока недоступными
    function disableCards() {
        const cardsArea = window.gameData.isPlayerTurn ? botCards : playerCards

        cardsArea.querySelectorAll('.card').forEach(card => {
            card.style.pointerEvents = 'none'
            card.style.opacity = '0.7'
            card.draggable = false
        })
    }

    // делаем карты текущего игрока доступными
    function enableCards() {
        const cardsArea = window.gameData.isPlayerTurn ? botCards : playerCards
        
        cardsArea.querySelectorAll('.card').forEach(card => {
            card.style.pointerEvents = 'auto'
            card.style.opacity = '1'
            card.draggable = true
        })
    }

    // очистить стол
    function clearTable() {
        // удалить карты из всех слотов
        document.querySelectorAll('.card-slot').forEach(slot => {
            slot.querySelector('.attack-slot').innerHTML = ''
            slot.querySelector('.defense-slot').innerHTML = ''
        })
    }
    
    // передать карты защищающемуся игроку
    function moveCardsToDefender() {
        // определение того, кто защищался
        const defenderArea = window.gameData.isPlayerTurn ? botCards : playerCards
        const defenderHand = window.gameData.isPlayerTurn ? 'botHand' : 'playerHand'
        const attackerHand = window.gameData.isPlayerTurn ? 'playerHand' : 'botHand'
        // выбрать все карты на столе
        document.querySelectorAll('.card-slot').forEach(slot => {
            const attackCard = slot.querySelector('.attack-slot img')
            const defenseCard = slot.querySelector('.defense-slot img')
            // проверяем сначала атакующие карты, потом защищающие
            if (attackCard) {
                // создаем карту
                const cardData = {
                    suit: attackCard.dataset.suit,
                    rank: attackCard.dataset.rank,
                    power: parseInt(attackCard.dataset.power),
                    isTrump: attackCard.dataset.isTrump === 'true',
                    skin: attackCard.src
                }
                // проверяем, нет ли уже такой карты в руке защитника
                const cardExists = window.gameData[defenderHand].some(c => 
                    c.suit === cardData.suit && c.rank === cardData.rank
                )
                // если нет, то добавляем ее защищающемуся игроку
                if (!cardExists) { window.gameData[defenderHand].push(cardData) }
                // ищем эту карту у атакующего
                const index = window.gameData[attackerHand].findIndex(c => 
                    c.suit === attackCard.dataset.suit && c.rank === attackCard.dataset.rank
                )
                // удаляем карту из руки атакующего
                if (index !== -1) { window.gameData[attackerHand].splice(index, 1) }
                // карте присваивается класс в зависимости от того, в какую руку она уходит
                attackCard.classList.add(window.gameData.isPlayerTurn ? 'down-jump-card' : 'jump-card')
                defenderArea.appendChild(attackCard)
            }
            // аналогично
            if (defenseCard) {
                const cardData = {
                    suit: defenseCard.dataset.suit,
                    rank: defenseCard.dataset.rank,
                    power: parseInt(defenseCard.dataset.power),
                    isTrump: defenseCard.dataset.isTrump === 'true',
                    skin: defenseCard.src
                }
                const cardExists = window.gameData[defenderHand].some(c => 
                    c.suit === cardData.suit && c.rank === cardData.rank
                )
                if (!cardExists) { window.gameData[defenderHand].push(cardData) }
                defenseCard.classList.add(window.gameData.isPlayerTurn ? 'down-jump-card' : 'jump-card')
                defenderArea.appendChild(defenseCard)
            }
        })
    }
})