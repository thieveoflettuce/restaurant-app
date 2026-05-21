const { Pool } = require('pg');
require('dotenv').config();

function optionalString(value) {
    if (value == null || value === '') return undefined;
    return String(value);
}

function poolConfig() {
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
        return { connectionString: String(databaseUrl) };
    }
    const portRaw = optionalString(process.env.PGPORT);
    let port;
    if (portRaw !== undefined) {
        const n = Number(portRaw);
        port = Number.isFinite(n) ? n : undefined;
    }
    const portFromDb = optionalString(process.env.DB_PORT);
    if (port === undefined && portFromDb !== undefined) {
        const n = Number(portFromDb);
        port = Number.isFinite(n) ? n : undefined;
    }
    return {
        user: optionalString(process.env.PGUSER ?? process.env.DB_USER),
        host: optionalString(process.env.PGHOST ?? process.env.DB_HOST) ?? 'localhost',
        database: optionalString(process.env.PGDATABASE ?? process.env.DB_NAME),
        password: String(
            process.env.PGPASSWORD ?? process.env.DB_PASSWORD ?? ''
        ),
        port: port ?? 5432,
    };
}

const pool = new Pool(poolConfig());

pool.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к БД:', err.stack);
    } else {
        console.log('Подключение к БД успешно');
    }
});

module.exports = pool;