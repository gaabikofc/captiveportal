const { success, failure, json } = require("./_shared/http");
const { validateAuthorizePayload, parseId } = require("./_shared/validators");
const captiveModel = require("./_shared/captiveModel");
const routerIntegrationService = require("./_shared/routerIntegrationService");

exports.handler = async (event) => {
    if (event.httpMethod === "OPTIONS") {
        return json(204, {});
    }

    if (event.httpMethod !== "POST") {
        return failure(405, "Metodo nao permitido.");
    }

    const id = parseId(event.queryStringParameters?.id);
    if (!id) {
        return failure(400, "ID invalido.");
    }

    let body;
    try {
        body = JSON.parse(event.body || "{}");
    } catch (error) {
        return failure(400, "JSON invalido.");
    }

    const { errors, payload } = validateAuthorizePayload(body);
    if (errors.length > 0) {
        return failure(400, "Dados de entrada invalidos.", errors);
    }

    try {
        const existingUser = await captiveModel.findById(id);
        if (!existingUser) {
            return failure(404, "Usuario nao encontrado.");
        }

        const user = await captiveModel.updateAuthorization(id, payload.autorizado);

        if (payload.autorizado) {
            await routerIntegrationService.releaseAccess(user);
        }

        return success(200, payload.autorizado
            ? "Usuario autorizado e encaminhado para integracao de rede."
            : "Autorizacao removida com sucesso.", {
            usuario: {
                id: Number(user.id),
                nome: user.nome,
                telefone: user.telefone,
                ip: user.ip,
                macAddress: user.mac_address,
                criadoEm: user.criado_em,
                autorizado: user.autorizado
            }
        });
    } catch (error) {
        console.error(error);
        return failure(500, "Erro ao atualizar autorizacao.");
    }
};
