const db = require("../config/db");

async function createUser({ nome, telefone, ip, macAddress }) {
    const query = `
        INSERT INTO wifi_leads (nome, telefone, ip, mac_address)
        VALUES ($1, $2, $3, $4)
        RETURNING id, nome, telefone, ip, mac_address, criado_em, autorizado
    `;

    const values = [nome, telefone, ip, macAddress];
    const { rows } = await db.query(query, values);
    return rows[0];
}

async function findById(id) {
    const query = `
        SELECT id, nome, telefone, ip, mac_address, criado_em, autorizado
        FROM wifi_leads
        WHERE id = $1
        LIMIT 1
    `;

    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
}

async function updateAuthorization(id, autorizado) {
    const query = `
        UPDATE wifi_leads
        SET autorizado = $2
        WHERE id = $1
        RETURNING id, nome, telefone, ip, mac_address, criado_em, autorizado
    `;

    const { rows } = await db.query(query, [id, autorizado]);
    return rows[0] || null;
}

module.exports = {
    createUser,
    findById,
    updateAuthorization
};
