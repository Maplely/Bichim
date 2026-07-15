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
## Paleta de Cores

Tema dark/light controlado via `data-theme` com CSS custom properties definidas em `src/layouts/BaseLayout.astro` e objetos JS em `src/components/Chat/constants.js`.

| Token | Dark | Light | Uso |
|-------|------|-------|-----|
| `base` | `#0F0F0F` | `#FFFFFF` | Fundo da página |
| `mantle` | `#1A1A1A` | `#F9F7F4` | Cards, sidebar |
| `crust` / `surface0` | `#252525` | `#F0EDE8` | Inputs, superfícies elevadas |
| `surface1` | `#2D2D2D` | `#FDFBF8` | Hover, dropdowns |
| `surface2` | `#3A3A3A` | `#EDE9E0` | Bordas internas |
| `text` | `#FFFFFF` | `#1A1A1A` | Texto principal |
| `sub0` | `#BFBFBF` | `#5A5A5A` | Texto secundário |
| `sub1` | `#808080` | `#6E6E6E` | Labels, metadados |
| `ov0` / `borda` | `#636363` | `#979797` | Bordas, placeholders |
| `mauve` | `#EA5A3E` | `#C73F2E` | Ação principal, botões, links |
| `peach` | `#FFB547` | `#C4871C` | Acento secundário |
| `green` | `#4ADE80` | `#22C55E` | Sucesso, online |
| `blue` | `#60A5FA` | `#3B82F6` | Info, admin |
| `yellow` | `#FDB022` | `#F59E0B` | Warning, pinned |
| `red` | `#FF6B6B` | `#EF4444` | Erro, perigo |
| `pink` | `#3A2420` | `#FFE8E0` | Bolha de mensagem própria |
| `chatReceived` | `#2A2A2A` | `#F0EDE8` | Bolha de mensagem alheia |

**Avatar palette:** `#EA5A3E`, `#C4871C`, `#60A5FA`, `#4ADE80`, `#FDB022`, `#BE8700`, `#C4B5A0`, `#FF8A6B`

