function errorHandler(error, req, res, next) {
    const statusCode = Number(error.statusCode || 500);

    if (statusCode >= 500) {
        console.error(error);
    }

    res.status(statusCode).json({
        success: false,
        message: error.message || "Erro interno do servidor.",
        errors: error.details || null
    });
}

module.exports = {
    errorHandler
};
