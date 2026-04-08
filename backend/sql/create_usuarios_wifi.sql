CREATE TABLE IF NOT EXISTS wifi_leads (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    telefone VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE wifi_leads
    ADD COLUMN IF NOT EXISTS nome VARCHAR(150),
    ADD COLUMN IF NOT EXISTS email VARCHAR(150),
    ADD COLUMN IF NOT EXISTS telefone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

UPDATE wifi_leads
SET nome = COALESCE(nome, '')
WHERE nome IS NULL;

UPDATE wifi_leads
SET telefone = COALESCE(telefone, '')
WHERE telefone IS NULL;

UPDATE wifi_leads
SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP)
WHERE created_at IS NULL;

ALTER TABLE wifi_leads
    ALTER COLUMN nome SET NOT NULL,
    ALTER COLUMN telefone SET NOT NULL,
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_wifi_leads_email'
    ) THEN
        ALTER TABLE wifi_leads
            ADD CONSTRAINT uq_wifi_leads_email UNIQUE (email);
    END IF;
END $$;
