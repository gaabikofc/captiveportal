<?php

declare(strict_types=1);

require_once __DIR__ . '/app/helpers.php';
require_once __DIR__ . '/app/config/db.php';

const WIFI_PASSWORD = 'SUA-SENHA-WIFI-AQUI';
const INSTAGRAM_URL = 'https://www.instagram.com/centrohipicoequus/';

$errors = [];
$successMessage = '';
$formData = [
    'nome' => '',
    'email' => '',
    'telefone' => '',
    'checkbox' => false,
];

$_SESSION['landing_started'] = $_SESSION['landing_started'] ?? false;
$_SESSION['instagram_unlocked'] = $_SESSION['instagram_unlocked'] ?? false;
$_SESSION['form_completed'] = $_SESSION['form_completed'] ?? false;

if (isset($_GET['reset']) && $_GET['reset'] === '1') {
    $_SESSION['landing_started'] = false;
    $_SESSION['instagram_unlocked'] = false;
    $_SESSION['form_completed'] = false;
    unset($_SESSION['lead_name']);
    redirectTo('index.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrfToken($_POST['csrf_token'] ?? null)) {
        http_response_code(403);
        exit('Requisicao invalida.');
    }

    $action = $_POST['action'] ?? '';

    if ($action === 'start_access') {
        $_SESSION['landing_started'] = true;
        redirectTo('index.php');
    }

    if ($action === 'instagram_step' && $_SESSION['landing_started'] === true) {
        $_SESSION['instagram_unlocked'] = true;

        $instagramUrl = trim(INSTAGRAM_URL);
        if ($instagramUrl !== '') {
            redirectTo($instagramUrl);
        }

        $successMessage = 'Adicione o link do Instagram em INSTAGRAM_URL para testar o redirecionamento.';
    }

    if ($action === 'save_lead' && $_SESSION['instagram_unlocked'] === true) {
        $nome = trim((string) ($_POST['nome'] ?? ''));
        $email = trim((string) ($_POST['email'] ?? ''));
        $telefone = preg_replace('/\D+/', '', (string) ($_POST['telefone'] ?? '')) ?? '';
        $checkboxAccepted = isset($_POST['checkbox']) && $_POST['checkbox'] === '1';

        $formData['nome'] = $nome;
        $formData['email'] = $email;
        $formData['telefone'] = $telefone;
        $formData['checkbox'] = $checkboxAccepted;

        if ($nome === '' || mb_strlen($nome) < 3) {
            $errors[] = 'Informe o nome completo.';
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Informe um e-mail valido.';
        }

        if (strlen($telefone) < 10 || strlen($telefone) > 11) {
            $errors[] = 'Informe um telefone valido com DDD.';
        }

        if (!$checkboxAccepted) {
            $errors[] = 'Voce precisa marcar a opcao antes de enviar.';
        }

        if ($errors === []) {
            try {
                $pdo = getPdo();
                $sql = 'INSERT INTO wifi_leads (nome_completo, email, telefone)
                        VALUES (:nome_completo, :email, :telefone)';
                $stmt = $pdo->prepare($sql);
                $stmt->bindValue(':nome_completo', $nome, PDO::PARAM_STR);
                $stmt->bindValue(':email', $email, PDO::PARAM_STR);
                $stmt->bindValue(':telefone', $telefone, PDO::PARAM_STR);
                $stmt->execute();

                $_SESSION['form_completed'] = true;
                $_SESSION['lead_name'] = $nome;
                session_regenerate_id(true);

                redirectTo('index.php');
            } catch (PDOException $exception) {
                if ((int) $exception->getCode() === 23000) {
                    $errors[] = 'Este e-mail ja foi cadastrado.';
                } else {
                    $errors[] = 'Nao foi possivel salvar no banco agora. Verifique a conexao.';
                }
            }
        }
    }
}

$showRules = $_SESSION['landing_started'] === true;
$instagramUnlocked = $_SESSION['instagram_unlocked'] === true;
$formCompleted = $_SESSION['form_completed'] === true;
$leadName = escape($_SESSION['lead_name'] ?? '');
$instagramUrl = trim(INSTAGRAM_URL) !== '' ? INSTAGRAM_URL : '#';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acesso a Internet</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <style>
        :root {
            --page-bg: #eef4ef;
            --card-bg: #ffffff;
            --text-main: #1f2937;
            --muted: #6b7280;
            --success-soft: #d1e7dd;
            --instagram: #e1306c;
            --shadow-soft: 0 20px 45px rgba(15, 23, 42, 0.10);
            --radius-main: 22px;
        }

        body {
            min-height: 100vh;
            margin: 0;
            font-family: 'Poppins', sans-serif;
            background:
                radial-gradient(circle at top left, rgba(25, 135, 84, 0.12), transparent 34%),
                linear-gradient(180deg, #f7faf7 0%, var(--page-bg) 100%);
            color: var(--text-main);
        }

        .page-shell {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 32px 16px;
        }

        .access-card {
            width: 100%;
            max-width: 560px;
            background: var(--card-bg);
            border-radius: var(--radius-main);
            box-shadow: var(--shadow-soft);
            padding: 32px;
            border: 1px solid rgba(15, 23, 42, 0.06);
            overflow: hidden;
        }

        .wifi-badge {
            width: 82px;
            height: 82px;
            border-radius: 24px;
            display: grid;
            place-items: center;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #198754, #22c55e);
            color: #fff;
            font-size: 2rem;
        }

        .hero-title {
            text-align: center;
            font-weight: 700;
            font-size: 1.9rem;
            margin-bottom: 10px;
        }

        .hero-text {
            text-align: center;
            color: var(--muted);
            margin-bottom: 18px;
        }

        .notice-strip {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 12px 14px;
            margin-bottom: 24px;
            border-radius: 16px;
            background: rgba(25, 135, 84, 0.08);
            color: #166534;
            font-weight: 600;
            text-align: center;
        }

        .cta-button {
            min-height: 68px;
            border-radius: 18px;
            font-weight: 600;
            font-size: 1.05rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            box-shadow: 0 14px 28px rgba(25, 135, 84, 0.24);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .cta-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 18px 32px rgba(25, 135, 84, 0.28);
        }

        .step-box {
            background: #f8fafc;
            border: 1px solid rgba(148, 163, 184, 0.18);
            border-radius: 18px;
            padding: 18px;
            margin-bottom: 16px;
            transform: translateY(18px);
            opacity: 0;
            transition: transform 0.55s ease, opacity 0.55s ease, box-shadow 0.25s ease;
        }

        .step-box.disabled {
            opacity: 0.58;
        }

        .step-box.active-step {
            border-color: rgba(25, 135, 84, 0.28);
            box-shadow: 0 14px 26px rgba(25, 135, 84, 0.08);
        }

        .step-box.is-visible {
            transform: translateY(0);
            opacity: 1;
        }

        .step-title {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0;
        }

        .instagram-button {
            background: var(--instagram);
            border-color: var(--instagram);
            color: #fff;
            border-radius: 14px;
            font-weight: 600;
            min-height: 52px;
        }

        .instagram-button:hover,
        .instagram-button:focus {
            background: #c5275d;
            border-color: #c5275d;
            color: #fff;
        }

        .form-control {
            border-radius: 14px;
            min-height: 50px;
        }

        .form-check-card {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 14px 16px;
            border-radius: 16px;
            background: #ffffff;
            border: 1px solid rgba(148, 163, 184, 0.22);
            transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        }

        .form-check-card:focus-within {
            border-color: rgba(25, 135, 84, 0.38);
            box-shadow: 0 0 0 0.18rem rgba(25, 135, 84, 0.12);
            background: #fafffc;
        }

        .form-check-input.custom-check {
            width: 1.25rem;
            height: 1.25rem;
            margin-top: 0.1rem;
            border-radius: 0.45rem;
            border: 1px solid rgba(100, 116, 139, 0.45);
            cursor: pointer;
            flex-shrink: 0;
        }

        .form-check-input.custom-check:checked {
            background-color: #198754;
            border-color: #198754;
        }

        .form-check-label.custom-check-label {
            margin: 0;
            font-size: 0.95rem;
            line-height: 1.45;
            color: var(--text-main);
            cursor: pointer;
        }

        .submit-wrapper {
            gap: 14px;
        }

        .cta-button:disabled {
            box-shadow: none;
            transform: none;
            opacity: 0.7;
        }

        .password-box {
            background: var(--success-soft);
            border: 1px solid rgba(25, 135, 84, 0.18);
            border-radius: 18px;
            padding: 24px;
            text-align: center;
            transform: translateY(18px);
            opacity: 0;
            transition: transform 0.55s ease, opacity 0.55s ease;
        }

        .password-box.is-visible {
            transform: translateY(0);
            opacity: 1;
        }

        .wifi-password {
            font-size: clamp(2rem, 5vw, 3rem);
            font-weight: 700;
            letter-spacing: 2px;
            line-height: 1.1;
            margin-bottom: 18px;
            word-break: break-word;
        }

        .copy-button {
            min-height: 60px;
            border-radius: 16px;
            font-weight: 700;
            font-size: 1rem;
            box-shadow: 0 14px 28px rgba(25, 135, 84, 0.20);
        }

        .reset-button {
            min-height: 54px;
            border-radius: 16px;
            font-weight: 600;
        }

        .copy-feedback {
            min-height: 24px;
            color: #166534;
            font-size: 0.95rem;
            font-weight: 600;
            margin-top: 12px;
        }

        .flow-panel {
            transition: opacity 0.35s ease, transform 0.35s ease;
        }

        .flow-panel.is-exiting {
            opacity: 0;
            transform: translateY(-8px) scale(0.985);
        }

        .intro-copy {
            transition: opacity 0.45s ease, transform 0.45s ease;
        }

        .intro-copy.compact {
            opacity: 0.88;
            transform: translateY(-2px);
        }

        .step-index {
            width: 34px;
            height: 34px;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: rgba(25, 135, 84, 0.10);
            color: #198754;
            font-weight: 700;
            margin-right: 10px;
        }

        .step-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }

        .step-header.simple {
            justify-content: center;
            margin-bottom: 18px;
        }

        .step-index {
            display: none;
        }

        .fade-slide {
            opacity: 0;
            transform: translateY(12px);
            transition: opacity 0.4s ease, transform 0.4s ease;
        }

        .fade-slide.show {
            opacity: 1;
            transform: translateY(0);
        }
    </style>
</head>
<body>
    <main class="page-shell">
        <section class="access-card">
            <div class="wifi-badge">
                <i class="bi bi-wifi"></i>
            </div>

            <div class="intro-copy <?= $showRules ? 'compact' : ''; ?>">
                <h1 class="hero-title">CONECTE AGORA</h1>
                <p class="hero-text">Conexao rapida. Voce esta no lugar certo para acessar o Wi-Fi.</p>
            </div>

            <div class="notice-strip">
                <i class="bi bi-check-circle-fill"></i>
                <span>Libere seu acesso em poucos segundos.</span>
            </div>

            <?php if ($errors !== []): ?>
                <div class="alert alert-danger" role="alert">
                    <ul class="mb-0 ps-3">
                        <?php foreach ($errors as $error): ?>
                            <li><?= escape($error); ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            <?php endif; ?>

            <?php if ($successMessage !== ''): ?>
                <div class="alert alert-warning" role="alert">
                    <?= escape($successMessage); ?>
                </div>
            <?php endif; ?>

            <div id="ctaPanel" class="flow-panel collapse <?= $showRules ? '' : 'show'; ?>">
                <form method="post" class="d-grid" id="startAccessForm">
                    <input type="hidden" name="csrf_token" value="<?= escape(csrfToken()); ?>">
                    <input type="hidden" name="action" value="start_access">
                    <button type="submit" class="btn btn-success cta-button" id="startAccessButton">
                        <i class="bi bi-wifi"></i>
                        CONECTE AGORA
                    </button>
                </form>
            </div>

            <div id="stepsPanel" class="collapse <?= $showRules ? 'show' : ''; ?>">
                <?php if (!$formCompleted): ?>
                    <div class="fade-slide">
                        <div class="step-box active-step">
                            <div class="step-header simple">
                                <div class="step-title">Acesse rapido pelo Instagram</div>
                            </div>

                            <form method="post" class="d-none" id="instagramUnlockForm">
                                <input type="hidden" name="csrf_token" value="<?= escape(csrfToken()); ?>">
                                <input type="hidden" name="action" value="instagram_step">
                            </form>

                            <a
                                href="<?= escape($instagramUrl); ?>"
                                target="_blank"
                                rel="noopener noreferrer"
                                id="instagramLink"
                                class="btn instagram-button w-100 d-inline-flex align-items-center justify-content-center gap-2"
                            >
                                <i class="bi bi-instagram"></i>
                                Ir para o Instagram
                            </a>
                        </div>
                    </div>

                    <div class="fade-slide">
                        <div class="step-box <?= $instagramUnlocked ? 'active-step' : 'disabled'; ?>" id="stepTwoBox">
                            <div class="step-header simple">
                                <div class="step-title">Preencha e receba sua senha</div>
                            </div>

                            <form method="post" novalidate>
                                <input type="hidden" name="csrf_token" value="<?= escape(csrfToken()); ?>">
                                <input type="hidden" name="action" value="save_lead">

                                <div class="mb-3">
                                    <label for="nome" class="form-label">Nome completo</label>
                                    <input
                                        type="text"
                                        class="form-control"
                                        id="nome"
                                        name="nome"
                                        maxlength="150"
                                        value="<?= escape($formData['nome']); ?>"
                                        <?= $instagramUnlocked ? '' : 'disabled data-instagram-field="true"'; ?>
                                        required
                                    >
                                </div>

                                <div class="mb-3">
                                    <label for="email" class="form-label">E-mail</label>
                                    <input
                                        type="email"
                                        class="form-control"
                                        id="email"
                                        name="email"
                                        maxlength="150"
                                        placeholder="nome@exemplo.com"
                                        value="<?= escape($formData['email']); ?>"
                                        <?= $instagramUnlocked ? '' : 'disabled data-instagram-field="true"'; ?>
                                        required
                                    >
                                </div>

                                <div class="mb-3">
                                    <label for="telefone" class="form-label">Telefone</label>
                                    <input
                                        type="tel"
                                        class="form-control"
                                        id="telefone"
                                        name="telefone"
                                        maxlength="15"
                                        placeholder="(11) 99999-9999"
                                        value="<?= escape($formData['telefone']); ?>"
                                        <?= $instagramUnlocked ? '' : 'disabled data-instagram-field="true"'; ?>
                                        required
                                    >
                                </div>

                                <div class="d-grid submit-wrapper">
                                    <div class="form-check-card">
                                        <input
                                            type="checkbox"
                                            class="form-check-input custom-check"
                                            id="checkbox"
                                            name="checkbox"
                                            value="1"
                                            <?= $formData['checkbox'] ? 'checked' : ''; ?>
                                            <?= $instagramUnlocked ? '' : 'disabled data-instagram-field="true"'; ?>
                                            required
                                        >
                                        <label for="checkbox" class="form-check-label custom-check-label">
                                            Concordo com o envio.
                                        </label>
                                    </div>

                                    <button type="submit" class="btn btn-success cta-button" id="stepTwoSubmit" <?= $instagramUnlocked && $formData['checkbox'] ? '' : 'disabled'; ?>>
                                        Enviar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                <?php endif; ?>

                <?php if ($formCompleted): ?>
                    <div class="fade-slide">
                        <div class="password-box mt-4">
                            <div class="wifi-badge mb-3" style="margin-bottom: 14px;">
                                <i class="bi bi-wifi"></i>
                            </div>
                            <h2 class="h3 mb-2">SENHA DO WIFI<?= $leadName !== '' ? ', ' . $leadName : ''; ?></h2>
                            <div class="wifi-password" id="wifiPasswordText"><?= escape(WIFI_PASSWORD); ?></div>
                            <button type="button" class="btn btn-success w-100 copy-button" onclick="copyWifiPassword()">
                                <i class="bi bi-clipboard"></i>
                                COPIAR
                            </button>
                            <a href="index.php?reset=1" class="btn btn-outline-secondary w-100 reset-button mt-3">
                                Reiniciar para novo acesso
                            </a>
                            <div class="copy-feedback" id="copyFeedback"></div>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        </section>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        window.copyWifiPassword = function () {
            const passwordText = document.getElementById('wifiPasswordText');
            const copyFeedback = document.getElementById('copyFeedback');

            if (!passwordText) {
                return false;
            }

            const password = passwordText.textContent.trim();

            function updateFeedback(message) {
                if (copyFeedback) {
                    copyFeedback.textContent = message;
                }
            }

            function fallbackCopy() {
                const tempInput = document.createElement('input');
                tempInput.type = 'text';
                tempInput.value = password;
                tempInput.setAttribute('readonly', 'readonly');
                tempInput.style.position = 'fixed';
                tempInput.style.opacity = '0';
                tempInput.style.pointerEvents = 'none';
                document.body.appendChild(tempInput);
                tempInput.focus();
                tempInput.select();
                tempInput.setSelectionRange(0, tempInput.value.length);

                try {
                    const copied = document.execCommand('copy');
                    updateFeedback(copied ? 'Senha copiada.' : 'Copie a senha manualmente.');
                } catch (error) {
                    updateFeedback('Copie a senha manualmente.');
                }

                document.body.removeChild(tempInput);
            }

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(password).then(function () {
                    updateFeedback('Senha copiada.');
                }).catch(function () {
                    fallbackCopy();
                });

                return false;
            }

            fallbackCopy();
            return false;
        };

        document.addEventListener('DOMContentLoaded', function () {
            const ctaPanel = document.getElementById('ctaPanel');
            const stepsPanel = document.getElementById('stepsPanel');
            const startAccessForm = document.getElementById('startAccessForm');
            const startAccessButton = document.getElementById('startAccessButton');
            const instagramLink = document.getElementById('instagramLink');
            const instagramUnlockForm = document.getElementById('instagramUnlockForm');
            const stepTwoBox = document.getElementById('stepTwoBox');
            const stepTwoSubmit = document.getElementById('stepTwoSubmit');
            const marketingCheckbox = document.getElementById('checkbox');
            const instagramLockedFields = document.querySelectorAll('[data-instagram-field="true"]');
            const animatedItems = document.querySelectorAll('.fade-slide .step-box, .fade-slide .password-box');
            const phoneInput = document.getElementById('telefone');

            function revealFlowItems() {
                document.querySelectorAll('.fade-slide').forEach(function (wrapper, index) {
                    window.setTimeout(function () {
                        wrapper.classList.add('show');
                        const innerCard = wrapper.querySelector('.step-box, .password-box');
                        if (innerCard) {
                            innerCard.classList.add('is-visible');
                        }
                    }, 120 * (index + 1));
                });
            }

            if (stepsPanel && stepsPanel.classList.contains('show')) {
                revealFlowItems();
            }

            if (startAccessForm && startAccessButton && ctaPanel && stepsPanel) {
                startAccessForm.addEventListener('submit', function (event) {
                    event.preventDefault();

                    startAccessButton.disabled = true;
                    ctaPanel.classList.add('is-exiting');

                    const ctaCollapse = bootstrap.Collapse.getOrCreateInstance(ctaPanel, {
                        toggle: false
                    });

                    const stepsCollapse = bootstrap.Collapse.getOrCreateInstance(stepsPanel, {
                        toggle: false
                    });

                    window.setTimeout(function () {
                        ctaCollapse.hide();
                    }, 140);

                    ctaPanel.addEventListener('hidden.bs.collapse', function handleHidden() {
                        ctaPanel.removeEventListener('hidden.bs.collapse', handleHidden);
                        stepsCollapse.show();

                        stepsPanel.addEventListener('shown.bs.collapse', function handleShown() {
                            stepsPanel.removeEventListener('shown.bs.collapse', handleShown);
                            revealFlowItems();

                            window.setTimeout(function () {
                                startAccessForm.submit();
                            }, 520);
                        });
                    });
                });
            }

            if (instagramLink && instagramUnlockForm && stepTwoBox) {
                instagramLink.addEventListener('click', function () {
                    const formData = new FormData(instagramUnlockForm);

                    fetch('index.php', {
                        method: 'POST',
                        body: formData,
                        credentials: 'same-origin',
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    }).finally(function () {
                        stepTwoBox.classList.remove('disabled');
                        stepTwoBox.classList.add('active-step', 'is-visible');

                        instagramLockedFields.forEach(function (field) {
                            field.disabled = false;
                            field.removeAttribute('data-instagram-field');
                        });

                        if (stepTwoSubmit) {
                            stepTwoSubmit.disabled = !marketingCheckbox || !marketingCheckbox.checked;
                        }

                        window.setTimeout(function () {
                            const nameField = document.getElementById('nome');
                            if (nameField) {
                                nameField.focus();
                            }
                        }, 180);
                    });
                });
            }

            if (marketingCheckbox && stepTwoSubmit) {
                marketingCheckbox.addEventListener('change', function () {
                    stepTwoSubmit.disabled = !marketingCheckbox.checked;
                });
            }

            if (!phoneInput) {
                return;
            }

            phoneInput.addEventListener('input', function (event) {
                let value = event.target.value.replace(/\D/g, '').slice(0, 11);

                if (value.length > 10) {
                    value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
                } else if (value.length > 6) {
                    value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
                } else if (value.length > 2) {
                    value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
                } else if (value.length > 0) {
                    value = value.replace(/^(\d*)/, '($1');
                }

                event.target.value = value.trim();
            });
        });
    </script>
</body>
</html>
