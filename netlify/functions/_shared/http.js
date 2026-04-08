const defaultHeaders = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
};

function json(statusCode, payload, extraHeaders = {}) {
    return {
        statusCode,
        headers: {
            ...defaultHeaders,
            ...extraHeaders
        },
        body: JSON.stringify(payload)
    };
}

function success(statusCode, message, data) {
    return json(statusCode, {
        success: true,
        message,
        data
    });
}

function failure(statusCode, message, errors = null) {
    return json(statusCode, {
        success: false,
        message,
        errors
    });
}

module.exports = {
    json,
    success,
    failure
};
