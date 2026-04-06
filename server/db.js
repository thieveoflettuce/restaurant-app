const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

pool.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к БД:', err.stack);
    } else {
        console.log('Подключение к БД успешно');
    }
});

module.exports = pool;