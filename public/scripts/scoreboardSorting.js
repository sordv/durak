document.addEventListener('DOMContentLoaded', function() {
    // получаем таблицу
    const table = document.querySelector('.scoreboard-table-body')
    // получаем заголовки, которые можно сортировать
    const headers = document.querySelectorAll('.scoreboard-table-header th.sortable')
    // получаем строки таблицы
    const tbody = table.querySelector('tbody')
    // текущий способ отображения (сортировки) тбалицы
    let currentSortType = {
        // по умолчанию
        column: 'starts',
        direction: 'desc'
    }

    // сортировка таблицы
    function sortTable(sortType, direction) {
        // получаем массив всех строк таблицы
        const rows = Array.from(tbody.querySelectorAll('tr'))
        // сортировка строк
        rows.sort((a, b) => {
            // получаем значения из двух строк в соответствущем сортировке столбце
            const aValue = parseInt(a.querySelector(`td[data-${sortType}]`).dataset[sortType])
            const bValue = parseInt(b.querySelector(`td[data-${sortType}]`).dataset[sortType])
            
            if (direction === 'asc') {
                // если a > b, то вернется положительное значение
                // поэтому элементы поменяются местами
                // выполняется сортировка от меньшего к большему (asc)
                // если a < b, то ничего не произойдет и элементы останутся на местах
                return aValue - bValue
            } else {
                // если b < a, то вернется отрицательное значение
                // поэтому элементы останутся на своих местах
                // выполняется сортировка от большего к меньшему (desc)
                // если b > a, то элементы поменяются местами
                return bValue - aValue
            }
        })
        // очищаем тело тбалицы
        tbody.innerHTML = ''
        // добавляем все строки в тело таблицы
        rows.forEach(row => tbody.appendChild(row))
    }

    // обработка клика по заголовку
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const sortType = header.dataset.sort
            let direction
            if (sortType === currentSortType.column) {
                // если кликнули по уже отсортированному столбцу, то меняем направление
                direction = currentSortType.direction === 'asc' ? 'desc' : 'asc'
            } else {
                // если кликнули по другому столбцу, сортируем изначально от большего к меньшему
                direction = 'desc'
            }
            // обновляем текущее состояние сортировки
            currentSortType = {
                column: sortType,
                direction: direction
            }
            // удаляем классы сортировки у заголовков
            headers.forEach(i => { i.classList.remove('sorted-asc', 'sorted-desc') })
            // добавляем класс текущей сортировки к активному заголовку
            header.classList.add(`sorted-${direction}`)
            // сортируем 
            sortTable(sortType, direction)
        })
    })

    // применение сортировки по умолчанию 
    function applyDefaultSort() {
        const defaultHeader = Array.from(headers).find(header =>
            header.dataset.sort === currentSortType.column
        )
        if (defaultHeader) {
            defaultHeader.classList.add(`sorted-${currentSortType.direction}`)
            sortTable(currentSortType.column, currentSortType.direction)
        }
    }

    applyDefaultSort()
})