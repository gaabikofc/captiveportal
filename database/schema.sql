CREATE DATABASE IF NOT EXISTS tela_qrcode
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE tela_qrcode;

CREATE TABLE IF NOT EXISTS wifi_leads (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_wifi_leads_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
