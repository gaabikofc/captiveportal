const config = {
    instagramUrl: "https://www.instagram.com/centrohipicoequus/",
    apiUrl: "/api/save-lead",
    storageKey: "wifiLandingState"
};

const defaultState = {
    landingStarted: false,
    instagramUnlocked: false,
    formCompleted: false,
    leadName: "",
    wifiPassword: ""
};

function loadState() {
    try {
        const raw = sessionStorage.getItem(config.storageKey);
        return raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState };
    } catch (error) {
        return { ...defaultState };
    }
}

function saveState(nextState) {
    sessionStorage.setItem(config.storageKey, JSON.stringify(nextState));
}

function resetState() {
    sessionStorage.removeItem(config.storageKey);
}

function renderAlert(type, messages) {
    const alertContainer = document.getElementById("alertContainer");
    if (!alertContainer) {
        return;
    }

    if (!messages || messages.length === 0) {
        alertContainer.innerHTML = "";
        return;
    }

    const items = messages.map((message) => `<li>${message}</li>`).join("");
    alertContainer.innerHTML = `
        <div class="alert alert-${type}" role="alert">
            <ul class="mb-0 ps-3">${items}</ul>
        </div>
    `;
}

function sanitizeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function revealFlowItems(selector = ".fade-slide") {
    document.querySelectorAll(selector).forEach((wrapper, index) => {
        window.setTimeout(() => {
            wrapper.classList.add("show");
            const innerCard = wrapper.querySelector(".step-box, .password-box");
            if (innerCard) {
                innerCard.classList.add("is-visible");
            }
        }, 120 * (index + 1));
    });
}

function toggleLeadForm(enabled) {
    const stepTwoBox = document.getElementById("stepTwoBox");
    const fields = document.querySelectorAll("#leadForm input");
    const checkbox = document.getElementById("checkbox");
    const submitButton = document.getElementById("stepTwoSubmit");

    if (stepTwoBox) {
        stepTwoBox.classList.toggle("disabled", !enabled);
        stepTwoBox.classList.toggle("active-step", enabled);
        if (enabled) {
            stepTwoBox.classList.add("is-visible");
        }
    }

    fields.forEach((field) => {
        field.disabled = !enabled;
    });

    if (submitButton) {
        submitButton.disabled = !enabled || !checkbox.checked;
    }
}

function renderFromState(state) {
    const introCopy = document.getElementById("introCopy");
    const ctaPanel = document.getElementById("ctaPanel");
    const stepsPanel = document.getElementById("stepsPanel");
    const leadFlow = document.getElementById("leadFlow");
    const passwordPanel = document.getElementById("passwordPanel");
    const passwordTitle = document.getElementById("passwordTitle");
    const wifiPasswordText = document.getElementById("wifiPasswordText");
    const instagramLink = document.getElementById("instagramLink");

    instagramLink.href = config.instagramUrl;

    if (state.landingStarted) {
        introCopy.classList.add("compact");
        ctaPanel.classList.add("hidden-panel");
        stepsPanel.classList.remove("hidden-panel");
        revealFlowItems();
    } else {
        introCopy.classList.remove("compact");
        ctaPanel.classList.remove("hidden-panel");
        stepsPanel.classList.add("hidden-panel");
    }

    toggleLeadForm(state.instagramUnlocked);

    if (state.formCompleted) {
        leadFlow.classList.add("hidden-panel");
        passwordPanel.classList.remove("hidden-panel");
        passwordTitle.textContent = state.leadName
            ? `SENHA DO WIFI, ${state.leadName}`
            : "SENHA DO WIFI";
        wifiPasswordText.textContent = state.wifiPassword || "Defina WIFI_PASSWORD no Netlify.";
        revealFlowItems("#passwordPanel .fade-slide");
    } else {
        leadFlow.classList.remove("hidden-panel");
        passwordPanel.classList.add("hidden-panel");
    }
}

function validateForm(formData) {
    const errors = [];
    const telefone = formData.telefone.replace(/\D/g, "");

    if (!formData.nome || formData.nome.trim().length < 3) {
        errors.push("Informe o nome completo.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        errors.push("Informe um e-mail valido.");
    }

    if (telefone.length < 10 || telefone.length > 11) {
        errors.push("Informe um telefone valido com DDD.");
    }

    if (!formData.checkbox) {
        errors.push("Voce precisa marcar a opcao antes de enviar.");
    }

    return {
        errors,
        normalized: {
            nome: formData.nome.trim(),
            email: formData.email.trim(),
            telefone
        }
    };
}

function setupPhoneMask() {
    const phoneInput = document.getElementById("telefone");
    if (!phoneInput) {
        return;
    }

    phoneInput.addEventListener("input", (event) => {
        let value = event.target.value.replace(/\D/g, "").slice(0, 11);

        if (value.length > 10) {
            value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
        } else if (value.length > 6) {
            value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
        } else if (value.length > 0) {
            value = value.replace(/^(\d*)/, "($1");
        }

        event.target.value = value.trim();
    });
}

function setupCopyButton() {
    const copyButton = document.getElementById("copyPasswordButton");
    const copyFeedback = document.getElementById("copyFeedback");
    const passwordText = document.getElementById("wifiPasswordText");

    if (!copyButton || !copyFeedback || !passwordText) {
        return;
    }

    copyButton.addEventListener("click", async () => {
        const password = passwordText.textContent.trim();

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(password);
            } else {
                const tempInput = document.createElement("input");
                tempInput.type = "text";
                tempInput.value = password;
                tempInput.setAttribute("readonly", "readonly");
                tempInput.style.position = "fixed";
                tempInput.style.opacity = "0";
                document.body.appendChild(tempInput);
                tempInput.focus();
                tempInput.select();
                document.execCommand("copy");
                document.body.removeChild(tempInput);
            }

            copyFeedback.textContent = "Senha copiada.";
        } catch (error) {
            copyFeedback.textContent = "Copie a senha manualmente.";
        }
    });
}

function fillFormFromState(state) {
    document.getElementById("nome").value = state.leadName || "";
}

document.addEventListener("DOMContentLoaded", () => {
    let state = loadState();
    const startAccessButton = document.getElementById("startAccessButton");
    const instagramLink = document.getElementById("instagramLink");
    const leadForm = document.getElementById("leadForm");
    const checkbox = document.getElementById("checkbox");
    const submitButton = document.getElementById("stepTwoSubmit");
    const resetButton = document.getElementById("resetButton");

    fillFormFromState(state);
    renderFromState(state);
    setupPhoneMask();
    setupCopyButton();

    startAccessButton.addEventListener("click", () => {
        state = { ...state, landingStarted: true };
        saveState(state);
        renderFromState(state);
    });

    instagramLink.addEventListener("click", () => {
        state = { ...state, landingStarted: true, instagramUnlocked: true };
        saveState(state);
        renderFromState(state);

        window.setTimeout(() => {
            document.getElementById("nome")?.focus();
        }, 180);
    });

    checkbox.addEventListener("change", () => {
        submitButton.disabled = !checkbox.checked;
    });

    leadForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        renderAlert("danger", []);

        const formData = {
            nome: document.getElementById("nome").value,
            email: document.getElementById("email").value,
            telefone: document.getElementById("telefone").value,
            checkbox: checkbox.checked
        };

        const { errors, normalized } = validateForm(formData);
        if (errors.length > 0) {
            renderAlert("danger", errors.map(sanitizeHtml));
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Enviando...";

        try {
            const response = await fetch(config.apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(normalized)
            });

            const payload = await response.json();

            if (!response.ok) {
                const messages = Array.isArray(payload.errors) && payload.errors.length > 0
                    ? payload.errors
                    : ["Nao foi possivel salvar no banco agora."];
                renderAlert("danger", messages.map(sanitizeHtml));
                return;
            }

            state = {
                ...state,
                formCompleted: true,
                leadName: normalized.nome,
                wifiPassword: payload.wifiPassword || ""
            };

            saveState(state);
            renderFromState(state);
            renderAlert("danger", []);
        } catch (error) {
            renderAlert("danger", ["Falha ao conectar com a funcao da Netlify."]);
        } finally {
            submitButton.disabled = !checkbox.checked;
            submitButton.innerHTML = "Enviar";
        }
    });

    resetButton.addEventListener("click", () => {
        resetState();
        state = { ...defaultState };
        window.location.reload();
    });
});
