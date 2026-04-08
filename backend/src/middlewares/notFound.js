function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        message: "Rota nao encontrada.",
        errors: null
    });
}

module.exports = {
    notFoundHandler
};
