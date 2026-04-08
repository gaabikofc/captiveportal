CREATE TABLE IF NOT EXISTS wifi_leads (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(120),
    telefone VARCHAR(20),
    ip VARCHAR(45),
    mac_address VARCHAR(17),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    autorizado BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE wifi_leads
    ADD COLUMN IF NOT EXISTS nome VARCHAR(120),
    ADD COLUMN IF NOT EXISTS telefone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS ip VARCHAR(45),
    ADD COLUMN IF NOT EXISTS mac_address VARCHAR(17),
    ADD COLUMN IF NOT EXISTS criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS autorizado BOOLEAN DEFAULT FALSE;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'wifi_leads'
          AND column_name = 'nome_completo'
    ) THEN
        EXECUTE '
            UPDATE wifi_leads
            SET nome = COALESCE(nome, nome_completo)
            WHERE nome IS NULL
        ';
    END IF;
END $$;

UPDATE wifi_leads
SET telefone = COALESCE(telefone, '')
WHERE telefone IS NULL;

UPDATE wifi_leads
SET nome = COALESCE(nome, '')
WHERE nome IS NULL;

ALTER TABLE wifi_leads
    ALTER COLUMN nome SET NOT NULL,
    ALTER COLUMN telefone SET NOT NULL,
    ALTER COLUMN criado_em SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN autorizado SET DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_wifi_leads_autorizado ON wifi_leads (autorizado);
CREATE INDEX IF NOT EXISTS idx_wifi_leads_mac_address ON wifi_leads (mac_address);
CREATE INDEX IF NOT EXISTS idx_wifi_leads_ip ON wifi_leads (ip);
