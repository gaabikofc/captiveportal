const { success, failure, json } = require("./_shared/http");
const { validateRegisterPayload } = require("./_shared/validators");
const captiveModel = require("./_shared/captiveModel");

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

    const { errors, payload } = validateRegisterPayload(body);
    if (errors.length > 0) {
        return failure(400, "Dados de entrada invalidos.", errors);
    }

    try {
        const user = await captiveModel.createUser(payload);

        return success(201, "Cadastro recebido com sucesso.", {
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
        return failure(500, "Erro ao salvar no banco de dados.");
    }
};
