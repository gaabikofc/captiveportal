const captiveService = require("../services/captiveService");
const { badRequest } = require("../utils/httpErrors");
const {
    validateRegisterPayload,
    validateIdParam,
    validateAuthorizePayload
} = require("../utils/validators");

async function register(req, res, next) {
    try {
        const payload = validateRegisterPayload(req.body);
        const result = await captiveService.registerUser(payload);

        return res.status(201).json({
            success: true,
            message: "Cadastro recebido com sucesso.",
            data: result
        });
    } catch (error) {
        return next(error);
    }
}

async function getStatus(req, res, next) {
    try {
        const id = validateIdParam(req.params.id);
        const result = await captiveService.getUserStatus(id);

        return res.status(200).json({
            success: true,
            message: "Status consultado com sucesso.",
            data: result
        });
    } catch (error) {
        return next(error);
    }
}

async function authorize(req, res, next) {
    try {
        const id = validateIdParam(req.params.id);
        const payload = validateAuthorizePayload(req.body);
        const result = await captiveService.authorizeUser(id, payload);

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    register,
    getStatus,
    authorize
};
