const captiveModel = require("../models/captiveModel");
const routerIntegrationService = require("./routerIntegrationService");
const { notFound } = require("../utils/httpErrors");

async function registerUser(payload) {
    const user = await captiveModel.createUser(payload);

    return {
        usuario: {
            id: user.id,
            nome: user.nome,
            telefone: user.telefone,
            ip: user.ip,
            macAddress: user.mac_address,
            criadoEm: user.criado_em,
            autorizado: user.autorizado
        }
    };
}

async function getUserStatus(id) {
    const user = await captiveModel.findById(id);

    if (!user) {
        throw notFound("Usuario nao encontrado.");
    }

    return {
        usuario: {
            id: user.id,
            nome: user.nome,
            telefone: user.telefone,
            ip: user.ip,
            macAddress: user.mac_address,
            criadoEm: user.criado_em,
            autorizado: user.autorizado
        }
    };
}

async function authorizeUser(id, payload) {
    const existingUser = await captiveModel.findById(id);

    if (!existingUser) {
        throw notFound("Usuario nao encontrado.");
    }

    const updatedUser = await captiveModel.updateAuthorization(id, payload.autorizado);

    if (payload.autorizado) {
        await routerIntegrationService.releaseAccess(updatedUser);
    }

    return {
        message: payload.autorizado
            ? "Usuario autorizado e encaminhado para integracao de rede."
            : "Autorizacao removida com sucesso.",
        usuario: {
            id: updatedUser.id,
            nome: updatedUser.nome,
            telefone: updatedUser.telefone,
            ip: updatedUser.ip,
            macAddress: updatedUser.mac_address,
            criadoEm: updatedUser.criado_em,
            autorizado: updatedUser.autorizado
        }
    };
}

module.exports = {
    registerUser,
    getUserStatus,
    authorizeUser
};
