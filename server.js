import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';

import createApp from './backend/app.js';
import { setupSocket } from './backend/socket.js';
import Room from './backend/models/Room.js';
import db from './backend/config/db.js';

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, credentials: true },
});
app.set('io', io);

const { handler } = await import('./dist/server/entry.mjs');
app.use(handler);

setupSocket(io);

const EXPIRY_INTERVAL = 15 * 60 * 1000;
setInterval(() => {
  try {
    const removed = Room.expirarInativas();
    if (removed > 0) console.log(`[expiry] ${removed} sala(s) inativa(s) removida(s)`);
  } catch (err) {
    console.error('[expiry] Erro ao expirar salas:', err.message);
  }
}, EXPIRY_INTERVAL);

const SCHEDULE_INTERVAL = 10 * 1000;
setInterval(() => {
  try {
    const expired = Room.getExpiredMessages();
    if (expired.length > 0) {
      expired.forEach(msg => {
        io.to(`room:${msg.room_id}`).emit('message-deleted', { id: msg.id });
      });
      Room.deleteExpiredMessages();
      console.log(`[schedule] ${expired.length} mensagem(ns) expirada(s) removida(s)`);
    }
  } catch (err) {
    console.error('[schedule] Erro ao remover mensagens expiradas:', err.message);
  }
  try {
    const pending = Room.getPendingScheduled();
    if (pending.length > 0) {
      pending.forEach(row => Room.sendScheduledMessage(row));
      console.log(`[schedule] ${pending.length} mensagem(ns) agendada(s) enviada(s)`);
    }
  } catch (err) {
    console.error('[schedule] Erro ao enviar mensagens agendadas:', err.message);
  }
}, SCHEDULE_INTERVAL);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`[server] Bichim rodando em http://localhost:${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('Exceção não capturada:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('Promise rejeitada:', reason);
});
process.on('SIGTERM', () => { console.log('[server] SIGTERM received, closing database...'); db.close(); process.exit(0); });
process.on('SIGINT', () => { db.close(); process.exit(0); });
