const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
const rejectUnauthorized = process.env.PGSSL_REJECT_UNAUTHORIZED === "true";

if (!connectionString) {
    throw new Error("A variavel DATABASE_URL precisa estar configurada.");
}

const pool = new Pool({
    connectionString,
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

async function query(text, params) {
    return pool.query(text, params);
}

module.exports = {
    pool,
    query
};
