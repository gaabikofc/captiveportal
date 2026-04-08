function createHttpError(statusCode, message, details = null) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.details = details;
    return error;
}

function badRequest(message, details = null) {
    return createHttpError(400, message, details);
}

function notFound(message, details = null) {
    return createHttpError(404, message, details);
}

module.exports = {
    createHttpError,
    badRequest,
    notFound
};
