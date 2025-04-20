document.addEventListener('DOMContentLoaded', function() {
    // получаем таблицу
    const table = document.querySelector('.scoreboard-table')
    // получаем заголовки, которые можно сортировать
    const headers = table.querySelectorAll('th.sortable')
    // получаем строки таблицы
    const tbody = table.querySelector('tbody')
    
    // обработчик клика по заголовку
    headers.forEach(header => {
        header.addEventListener('click', () => {
            // получаем тип сортировки из атрибута data - rating или wins
            const sortType = header.dataset.sort
            // asc - от меньшего к большему
            // desc - от большего к меньшему
            const isAsc = !header.classList.contains('sorted-asc')
            // удаляем прошлые классы сортировки
            headers.forEach(i => { i.classList.remove('sorted-asc', 'sorted-desc') })
            // создаем соответствующий класс сортировки
            header.classList.add(isAsc ? 'sorted-asc' : 'sorted-desc')
            // получаем массив всех строк таблицы
            const rows = Array.from(tbody.querySelectorAll('tr'))
            // сортировка строк
            rows.sort((a, b) => {
                // получаем значения из двух строк в соответствущем сортировке столбце
                const aValue = parseInt(a.querySelector(`td[data-${sortType}]`).dataset[sortType])
                const bValue = parseInt(b.querySelector(`td[data-${sortType}]`).dataset[sortType])
                
                if (isAsc) {
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
            // очищаем тело таблицы
            tbody.innerHTML = ''
            // добавляем все строки в тело таблицы
            rows.forEach(row => tbody.appendChild(row))
        })
    })
})