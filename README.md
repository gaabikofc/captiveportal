# Captive Portal Wi-Fi no Netlify

Este projeto esta pronto para um deploy unico no Netlify:

- `frontend/` e publicado como site estatico
- `netlify/functions/` roda a API serverless em Node.js
- `Supabase` e o banco PostgreSQL

Nao e necessario subir frontend e backend em plataformas separadas.

## Como ficou a arquitetura

Fluxo:

1. o usuario abre o captive portal
2. o frontend envia os dados para `/api/captive/register`
3. a Netlify Function grava os dados em `wifi_leads` no Supabase
4. o frontend faz polling em `/api/captive/status/:id`
5. quando houver autorizacao, a function responde com `autorizado: true`

Rotas publicas:

- `POST /api/captive/register`
- `GET /api/captive/status/:id`
- `POST /api/captive/authorize/:id`

## Estrutura importante

```text
frontend/
  index.html
  assets/
    app.js
    config.js
    styles.css

netlify/
  functions/
    register.js
    status.js
    authorize.js
    _shared/
      db.js
      captiveModel.js
      validators.js
      routerIntegrationService.js
      http.js

backend/
  sql/create_usuarios_wifi.sql
```

## Banco no Supabase

O backend usa a tabela real `wifi_leads`.

Execute no SQL Editor do Supabase o arquivo [create_usuarios_wifi.sql](C:\xampp\htdocs\tela-qrcode2\backend\sql\create_usuarios_wifi.sql).

Esse script:

- cria `wifi_leads` se ela nao existir
- adiciona `nome`, `telefone`, `ip`, `mac_address`, `criado_em` e `autorizado`
- aproveita `nome_completo` se sua tabela antiga ainda tiver esse campo

## Variaveis de ambiente na Netlify

Cadastre estas variaveis no projeto da Netlify:

- `DATABASE_URL`
- `PGSSL_REJECT_UNAUTHORIZED`
- `ROUTER_PROVIDER`
- `ROUTER_API_URL`
- `ROUTER_API_TOKEN`

Exemplo:

```env
DATABASE_URL=postgresql://postgres.PROJECT_REF:SUA_SENHA@aws-1-us-east-1.pooler.supabase.com:6543/postgres
PGSSL_REJECT_UNAUTHORIZED=false
ROUTER_PROVIDER=mock
ROUTER_API_URL=
ROUTER_API_TOKEN=
```

Use a connection string do `Pooler` do Supabase, nao a `Direct connection`, porque o pooler e o caminho mais compativel com Netlify e outros ambientes serverless.

Em alguns ambientes locais do Windows, a validacao de certificados pode exigir ajustes extras para testes locais. No deploy da Netlify, mantenha o uso do pooler e a variavel `PGSSL_REJECT_UNAUTHORIZED=false` se a cadeia de certificados do ambiente nao estiver disponivel.

## Configuracao do Netlify

O projeto ja esta configurado em [netlify.toml](C:\xampp\htdocs\tela-qrcode2\netlify.toml):

- `publish = "frontend"`
- `functions = "netlify/functions"`
- redirects de `/api/captive/...` para as functions

Entao voce pode apontar a Netlify para a raiz do repositorio.

## Como subir

1. envie este projeto para um repositorio Git
2. conecte o repositorio na Netlify
3. nas configuracoes do site, mantenha a raiz do projeto
4. adicione as variaveis de ambiente
5. faça o deploy

Build command:

```bash
npm run build
```

Publish directory:

```bash
frontend
```

Functions directory:

```bash
netlify/functions
```

## Rodando localmente

```bash
npm install
npx netlify dev
```

## Validacao feita

Foi validado contra o Supabase:

- criacao/ajuste da tabela `wifi_leads`
- cadastro via endpoint de registro
- consulta de status
- autorizacao do usuario

## Observacao

Os arquivos PHP antigos e a estrutura `backend/` em Express continuam no repositorio como referencia, mas o caminho pronto para deploy unico no Netlify e o que esta em `frontend/` + `netlify/functions/`.
