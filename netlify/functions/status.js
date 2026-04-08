const { success, failure, json } = require("./_shared/http");
const { parseId } = require("./_shared/validators");
const captiveModel = require("./_shared/captiveModel");

exports.handler = async (event) => {
    if (event.httpMethod === "OPTIONS") {
        return json(204, {});
    }

    if (event.httpMethod !== "GET") {
        return failure(405, "Metodo nao permitido.");
    }

    const id = parseId(event.queryStringParameters?.id);
    if (!id) {
        return failure(400, "ID invalido.");
    }

    try {
        const user = await captiveModel.findById(id);

        if (!user) {
            return failure(404, "Usuario nao encontrado.");
        }

        return success(200, "Status consultado com sucesso.", {
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
        return failure(500, "Erro ao consultar status.");
    }
};
