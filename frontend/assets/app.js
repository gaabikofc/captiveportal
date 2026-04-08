const config = window.APP_CONFIG || {};
const storageKey = "captivePortalSession";
let pollingTimer = null;

function getApiUrl(path) {
    const baseUrl = String(config.apiBaseUrl || "").replace(/\/$/, "");
    return `${baseUrl}${path}`;
}

function saveSession(session) {
    sessionStorage.setItem(storageKey, JSON.stringify(session));
}

function loadSession() {
    try {
        const raw = sessionStorage.getItem(storageKey);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

function clearSession() {
    sessionStorage.removeItem(storageKey);
}

function showAlert(type, message) {
    const alertContainer = document.getElementById("alertContainer");
    alertContainer.innerHTML = message
        ? `<div class="alert alert-${type}" role="alert">${message}</div>`
        : "";
}

function formatPhoneInput(input) {
    let value = input.value.replace(/\D/g, "").slice(0, 11);

    if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
    } else if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
    } else if (value.length > 0) {
        value = value.replace(/^(\d*)/, "($1");
    }

    input.value = value.trim();
}

function getFormPayload() {
    return {
        nome: document.getElementById("nome").value.trim(),
        telefone: document.getElementById("telefone").value,
        ip: document.getElementById("ip").value.trim(),
        macAddress: document.getElementById("macAddress").value.trim()
    };
}

function validatePayload(payload) {
    if (payload.nome.length < 3) {
        return "Informe um nome valido.";
    }

    const phone = payload.telefone.replace(/\D/g, "");
    if (phone.length < 10 || phone.length > 11) {
        return "Informe um telefone valido com DDD.";
    }

    return null;
}

function renderStatus(session) {
    const statusPanel = document.getElementById("statusPanel");
    const statusMessage = document.getElementById("statusMessage");
    const statusMeta = document.getElementById("statusMeta");

    statusPanel.classList.remove("hidden-panel");

    if (session.autorizado) {
        statusMessage.textContent = "Acesso liberado. Seu dispositivo ja pode navegar.";
    } else {
        statusMessage.textContent = "Aguardando liberacao do acesso.";
    }

    statusMeta.innerHTML = `
        <div><strong>ID:</strong> ${session.id}</div>
        <div><strong>Nome:</strong> ${session.nome}</div>
        <div><strong>Status:</strong> ${session.autorizado ? "Autorizado" : "Pendente"}</div>
    `;
}

async function fetchStatus(id) {
    const response = await fetch(getApiUrl(`/api/captive/status/${id}`));
    const payload = await response.json();

    if (!response.ok) {
        throw new Error(payload.message || "Falha ao consultar status.");
    }

    return payload.data.usuario;
}

function startPolling(id) {
    stopPolling();
    pollingTimer = window.setInterval(async () => {
        try {
            const usuario = await fetchStatus(id);
            const session = {
                id: usuario.id,
                nome: usuario.nome,
                autorizado: usuario.autorizado
            };

            saveSession(session);
            renderStatus(session);

            if (usuario.autorizado) {
                stopPolling();
                showAlert("success", "Seu acesso foi liberado.");
            }
        } catch (error) {
            showAlert("warning", error.message);
        }
    }, 5000);
}

function stopPolling() {
    if (pollingTimer) {
        window.clearInterval(pollingTimer);
        pollingTimer = null;
    }
}

async function registerUser(payload) {
    const response = await fetch(getApiUrl("/api/captive/register"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        const details = Array.isArray(data.errors) ? data.errors.join(" ") : data.message;
        throw new Error(details || "Falha ao registrar usuario.");
    }

    return data.data.usuario;
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("captiveForm");
    const submitButton = document.getElementById("submitButton");
    const telephoneInput = document.getElementById("telefone");
    const resetButton = document.getElementById("resetButton");
    const existingSession = loadSession();

    telephoneInput.addEventListener("input", () => formatPhoneInput(telephoneInput));

    if (existingSession && existingSession.id) {
        renderStatus(existingSession);
        if (!existingSession.autorizado) {
            startPolling(existingSession.id);
        }
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        showAlert("", "");

        const payload = getFormPayload();
        const validationError = validatePayload(payload);

        if (validationError) {
            showAlert("danger", validationError);
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Enviando...";

        try {
            const usuario = await registerUser(payload);
            const session = {
                id: usuario.id,
                nome: usuario.nome,
                autorizado: usuario.autorizado
            };

            saveSession(session);
            renderStatus(session);
            showAlert("success", "Cadastro enviado. Agora estamos aguardando a liberacao.");

            if (!usuario.autorizado) {
                startPolling(usuario.id);
            }
        } catch (error) {
            showAlert("danger", error.message);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Solicitar acesso";
        }
    });

    resetButton.addEventListener("click", () => {
        stopPolling();
        clearSession();
        form.reset();
        document.getElementById("statusPanel").classList.add("hidden-panel");
        showAlert("", "");
    });
});
