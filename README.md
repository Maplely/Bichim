# Bichim

Chat em tempo real com salas públicas/privadas, DM, agendamento de mensagens, sistema de verificação por email e mais.

## Stack

- **Frontend:** Astro + React + Socket.IO Client
- **Backend:** Express + Socket.IO + SQLite (`node:sqlite`)
- **Auth:** JWT (jsonwebtoken + jose) + bcryptjs

## Requisitos

- Node.js **22+** (usa `node:sqlite`, módulo nativo)

## Setup

```bash
cp .env.example .env
# edite JWT_SECRET no .env

npm install
npm run build   # compila o frontend Astro
npm start       # http://localhost:3000
```

## Ambiente de desenvolvimento

```bash
npm install
npm start       # reinicia automaticamente com --watch se configurado
```

O banco SQLite e as migrações rodam automaticamente na primeira inicialização em `./data/chat.db`.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia servidor Express + Astro SSR |
| `npm run build` | Compila frontend Astro |
| `npm run dev` | Inicia servidor (alias para `npm start`) |
| `npm test` | Roda testes (vitest) |
| `npm run init-db` | Inicializa banco manualmente |

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `JWT_SECRET` | — | Chave secreta para assinar tokens JWT |
| `PORT` | `3000` | Porta do servidor HTTP |
| `DATABASE_PATH` | `./data/chat.db` | Caminho do arquivo SQLite |

## Estrutura

```
├── backend/
│   ├── config/db.js          # Conexão SQLite + migrações
│   ├── controllers/          # Auth, Room, Message, Preview
│   ├── middlewares/          # auth JWT, rateLimit, upload
│   ├── models/               # Usuario, Room, Message
│   ├── socket.js             # Eventos Socket.IO
│   └── app.js                # Config Express
├── src/                      # Frontend Astro + React
│   ├── components/           # ChatScreen, MsgBubble, etc.
│   └── pages/                # Rotas Astro
├── server.js                 # Entrypoint
└── db/init.sql               # Schema de referência
```
