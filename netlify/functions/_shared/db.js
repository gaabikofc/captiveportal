const { Pool } = require("pg");

let pool;

function getPool() {
    if (pool) {
        return pool;
    }

    if (!process.env.DATABASE_URL) {
        throw new Error("A variavel DATABASE_URL precisa estar configurada na Netlify.");
    }

    const rejectUnauthorized = process.env.PGSSL_REJECT_UNAUTHORIZED === "true";

    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized
        },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000
    });

    pool.on("error", (error) => {
        console.error("Pool PostgreSQL encontrou um erro inesperado:", error.message);
    });

    return pool;
}

async function query(text, params) {
    return getPool().query(text, params);
}

module.exports = {
    query
};
