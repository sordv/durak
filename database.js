const { Pool } = require('pg')

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'durak',
    password: 'admin',
    port: 5432,
})

// зачесть старт игры
pool.updateStarts = async (login) => {
    await pool.query('UPDATE players SET starts = starts + 1 WHERE login = $1', [login])
}

// зачесть конец игры
pool.updateEnds = async (login) => {
    await pool.query('UPDATE players SET ends = ends + 1 WHERE login = $1', [login])
}

module.exports = pool