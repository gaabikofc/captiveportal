const { badRequest } = require("./httpErrors");

function normalizeString(value) {
    return String(value || "").trim();
}

function normalizePhone(value) {
    return String(value || "").replace(/\D/g, "");
}

function normalizeMac(value) {
    return String(value || "")
        .trim()
        .toUpperCase()
        .replace(/-/g, ":");
}

function validateRegisterPayload(body) {
    const nome = normalizeString(body.nome);
    const telefone = normalizePhone(body.telefone);
    const ip = normalizeString(body.ip);
    const macAddress = normalizeMac(body.macAddress || body.mac_address);
    const errors = [];

    if (nome.length < 3 || nome.length > 120) {
        errors.push("Nome deve ter entre 3 e 120 caracteres.");
    }

    if (telefone.length < 10 || telefone.length > 11) {
        errors.push("Telefone deve conter DDD e 10 ou 11 digitos.");
    }

    if (ip && !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
        errors.push("IP invalido.");
    }

    if (macAddress && !/^[0-9A-F]{2}(:[0-9A-F]{2}){5}$/.test(macAddress)) {
        errors.push("MAC address invalido.");
    }

    if (errors.length > 0) {
        throw badRequest("Dados de entrada invalidos.", errors);
    }

    return {
        nome,
        telefone,
        ip: ip || null,
        macAddress: macAddress || null
    };
}

function validateIdParam(value) {
    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0) {
        throw badRequest("ID invalido.");
    }

    return id;
}

function validateAuthorizePayload(body) {
    if (typeof body.autorizado !== "boolean") {
        throw badRequest("O campo autorizado deve ser boolean.");
    }

    return {
        autorizado: body.autorizado
    };
}

module.exports = {
    validateRegisterPayload,
    validateIdParam,
    validateAuthorizePayload
};
