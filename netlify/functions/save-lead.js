const db = require("./_shared/db");
const { success, failure, json } = require("./_shared/http");

function validateLead(body) {
    const errors = [];
    const nome = String(body.nome || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const telefone = String(body.telefone || "").replace(/\D/g, "");
    const checkboxAccepted = body.checkbox === true;

    if (nome.length < 3) {
        errors.push("Informe o nome completo.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("Informe um e-mail valido.");
    }

    if (telefone.length < 10 || telefone.length > 11) {
        errors.push("Informe um telefone valido com DDD.");
    }

    if (!checkboxAccepted) {
        errors.push("Voce precisa marcar a opcao antes de enviar.");
    }

    return {
        errors,
        payload: {
            nome,
            email,
            telefone
        }
    };
}

exports.handler = async (event) => {
    if (event.httpMethod === "OPTIONS") {
        return json(204, {});
    }

    if (event.httpMethod !== "POST") {
        return failure(405, "Metodo nao permitido.");
    }

    let body;
    try {
        body = JSON.parse(event.body || "{}");
    } catch (error) {
        return failure(400, "JSON invalido.");
    }

    const { errors, payload } = validateLead(body);
    if (errors.length > 0) {
        return failure(400, "Dados de entrada invalidos.", errors);
    }

    try {
        const query = `
            INSERT INTO wifi_leads (nome, email, telefone)
            VALUES ($1, $2, $3)
            RETURNING id, nome, email, telefone, created_at
        `;
        const { rows } = await db.query(query, [payload.nome, payload.email, payload.telefone]);
        const lead = rows[0];

        return success(201, "Cadastro recebido com sucesso.", {
            usuario: {
                id: Number(lead.id),
                nome: lead.nome,
                email: lead.email,
                telefone: lead.telefone,
                criadoEm: lead.created_at
            },
            wifiPassword: process.env.WIFI_PASSWORD || ""
        });
    } catch (error) {
        console.error(error);

        if (error.code === "23505") {
            return failure(409, "Este e-mail ja foi cadastrado.");
        }

        return failure(500, "Nao foi possivel salvar no banco agora.");
    }
};
