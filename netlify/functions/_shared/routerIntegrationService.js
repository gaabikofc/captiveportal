async function releaseAccess(user) {
    const provider = process.env.ROUTER_PROVIDER || "mock";

    if (provider === "mock") {
        return {
            provider,
            released: true,
            target: {
                ip: user.ip,
                macAddress: user.mac_address
            }
        };
    }

    if (provider === "mikrotik") {
        if (!process.env.ROUTER_API_URL || !process.env.ROUTER_API_TOKEN) {
            throw new Error("Configure ROUTER_API_URL e ROUTER_API_TOKEN para usar integracao real.");
        }

        return {
            provider,
            released: false,
            message: "Adaptar a chamada da API do roteador neste service."
        };
    }

    throw new Error("ROUTER_PROVIDER invalido.");
}

module.exports = {
    releaseAccess
};
