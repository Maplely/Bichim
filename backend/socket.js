import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './middlewares/auth.js';
import Message from './models/Message.js';
import Room from './models/Room.js';
import db from './config/db.js';

function getUserName(userId) {
  const user = db.get('SELECT nome FROM usuarios WHERE id = ?', [userId]);
  return user?.nome || 'Alguém';
}

export function setupSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Token não fornecido'));
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.id;
      socket.userEmail = decoded.email;
      socket.userName = getUserName(decoded.id);
      next();
    } catch {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    const userRooms = new Set();
    const typingTimers = {};
    const typingUsers = {};
    const recordingUsers = {};

    function broadcastTyping(roomId) {
      const users = Object.entries(typingUsers[roomId] || {}).map(([id, name]) => ({
        userId: parseInt(id), userName: name,
      }));
      socket.to(`room:${roomId}`).emit('typing', { roomId, users });
    }

    function broadcastRecording(roomId) {
      const users = Object.entries(recordingUsers[roomId] || {}).map(([id, name]) => ({
        userId: parseInt(id), userName: name,
      }));
      socket.to(`room:${roomId}`).emit('recording', { roomId, users });
    }

    socket.on('join-room', async (roomId) => {
      try {
        socket.join(`room:${roomId}`);
        userRooms.add(roomId);
        Room.atualizarAtividade(roomId);

        const sockets = await io.in(`room:${roomId}`).fetchSockets();
        const online = sockets.map(s => s.userId).filter(Boolean);
        io.to(`room:${roomId}`).emit('online-users', { roomId, users: online });

        const userInfo = { id: socket.userId, nome: socket.userName };
        socket.to(`room:${roomId}`).emit('user-joined', { user: userInfo });

      } catch (err) {
        console.error('[socket] Erro ao entrar na sala:', err);
      }
    });

    socket.on('leave-room', async (roomId) => {
      socket.leave(`room:${roomId}`);
      userRooms.delete(roomId);

      const sockets = await io.in(`room:${roomId}`).fetchSockets();
      const online = sockets.map(s => s.userId).filter(Boolean);
      io.to(`room:${roomId}`).emit('online-users', { roomId, users: online });
    });

    socket.on('typing', (data) => {
      const { roomId } = data;
      if (!roomId) return;
      if (!typingUsers[roomId]) typingUsers[roomId] = {};
      typingUsers[roomId][socket.userId] = socket.userName;

      clearTimeout(typingTimers[`${socket.userId}:${roomId}`]);
      typingTimers[`${socket.userId}:${roomId}`] = setTimeout(() => {
        if (typingUsers[roomId]) delete typingUsers[roomId][socket.userId];
        broadcastTyping(roomId);
      }, 3000);

      broadcastTyping(roomId);
    });

    socket.on('stop-typing', ({ roomId }) => {
      clearTimeout(typingTimers[`${socket.userId}:${roomId}`]);
      if (typingUsers[roomId]) delete typingUsers[roomId][socket.userId];
      broadcastTyping(roomId);
    });

    socket.on('recording', (data) => {
      const { roomId } = data;
      if (!roomId) return;
      if (!recordingUsers[roomId]) recordingUsers[roomId] = {};
      recordingUsers[roomId][socket.userId] = socket.userName;

      clearTimeout(typingTimers[`rec:${socket.userId}:${roomId}`]);
      typingTimers[`rec:${socket.userId}:${roomId}`] = setTimeout(() => {
        if (recordingUsers[roomId]) delete recordingUsers[roomId][socket.userId];
        broadcastRecording(roomId);
      }, 3000);

      broadcastRecording(roomId);
    });

    socket.on('stop-recording', ({ roomId }) => {
      clearTimeout(typingTimers[`rec:${socket.userId}:${roomId}`]);
      if (recordingUsers[roomId]) delete recordingUsers[roomId][socket.userId];
      broadcastRecording(roomId);
    });

    socket.on('new-message', async (data, callback) => {
      try {
        const { roomId, content, reply_to } = data;
        if (!roomId || !content?.trim()) {
          if (callback) callback({ error: 'Dados inválidos' });
          return;
        }
        if (Message.checkMuted(roomId, socket.userId)) {
          if (callback) callback({ error: 'Você está silenciado nesta sala' });
          return;
        }
        const room = db.get(`SELECT disappear_after FROM rooms WHERE id = ?`, [roomId]);
        const expires_at = room?.disappear_after > 0 ? new Date(Date.now() + room.disappear_after * 1000).toISOString() : null;
        const message = await Message.criar({
          room_id: roomId,
          user_id: socket.userId,
          content: content.trim(),
          reply_to: reply_to || null,
          expires_at,
        });
        io.to(`room:${roomId}`).emit('message', message);
        if (callback) callback({ success: true, message });
      } catch (err) {
        console.error('[socket] Erro ao enviar mensagem:', err);
        if (callback) callback({ error: 'Erro interno' });
      }
    });

    socket.on('edit-message', async (data) => {
      try {
        const { messageId, content, roomId } = data;
        if (!messageId || !content?.trim()) return;
        const edited = await Message.editar(messageId, socket.userId, content.trim());
        if (edited) {
          io.to(`room:${roomId}`).emit('message-edited', edited);
        }
      } catch (err) {
        console.error('[socket] Erro ao editar mensagem:', err);
      }
    });

    socket.on('delete-message', async (data) => {
      try {
        const { messageId, roomId } = data;
        if (!messageId) return;
        await Message.deletar(messageId, socket.userId);
        io.to(`room:${roomId}`).emit('message-deleted', { id: messageId });
      } catch (err) {
        console.error('[socket] Erro ao deletar mensagem:', err);
      }
    });

    socket.on('react', async (data) => {
      try {
        const { messageId, emoji, roomId } = data;
        if (!messageId || !emoji) return;
        const reactions = await Message.toggleReaction(messageId, socket.userId, emoji);
        io.to(`room:${roomId}`).emit('reaction-update', { message_id: messageId, reactions });
      } catch (err) {
        console.error('[socket] Erro ao reagir:', err);
      }
    });

    socket.on('read-receipt', async (data) => {
      try {
        const { roomId, messageIds } = data;
        if (!roomId || !messageIds?.length) return;
        const now = new Date().toISOString();
        messageIds.forEach(mid => {
          db.run(`INSERT OR IGNORE INTO message_reads (message_id, user_id, room_id, read_at) VALUES (?, ?, ?, ?)`, [mid, socket.userId, roomId, now]);
        });
        io.to(`room:${roomId}`).emit('messages-read', {
          messageIds,
          userId: socket.userId,
          userName: socket.userName,
        });
      } catch (err) {
        console.error('[socket] Erro ao processar leitura:', err);
      }
    });

    socket.on('new-poll', async (data) => {
      try {
        const { roomId, question, options } = data;
        if (!roomId || !question || !options?.length) return;
        const pollId = db.run(`INSERT INTO polls (room_id, question, created_by) VALUES (?, ?, ?)`, [roomId, question, socket.userId]).insertId;
        options.forEach(opt => db.run(`INSERT INTO poll_options (poll_id, text) VALUES (?, ?)`, [pollId, opt]));
        const poll = db.get(`SELECT * FROM polls WHERE id = ?`, [pollId]);
        poll.options = db.query(`SELECT * FROM poll_options WHERE poll_id = ?`, [pollId]);
        poll.votes = [];
        io.to(`room:${roomId}`).emit('poll-created', poll);
      } catch (err) {
        console.error('[socket] Erro ao criar enquete:', err);
      }
    });

    socket.on('poll-vote', async (data) => {
      try {
        const { pollId, optionId, roomId } = data;
        if (!pollId || !optionId) return;
        const poll = db.get(`SELECT * FROM polls WHERE id = ?`, [pollId]);
        if (!poll || poll.is_closed) return;
        const existing = db.get(`SELECT * FROM poll_votes WHERE poll_id = ? AND user_id = ?`, [pollId, socket.userId]);
        if (existing) {
          db.run(`DELETE FROM poll_votes WHERE id = ?`, [existing.id]);
          if (existing.option_id === optionId) {
            io.to(`room:${roomId}`).emit('poll-update', { pollId, optionId, userId: socket.userId, removed: true });
            return;
          }
        }
        db.run(`INSERT OR REPLACE INTO poll_votes (poll_id, option_id, user_id) VALUES (?, ?, ?)`, [pollId, optionId, socket.userId]);
        io.to(`room:${roomId}`).emit('poll-update', { pollId, optionId, userId: socket.userId });
      } catch (err) {
        console.error('[socket] Erro ao votar:', err);
      }
    });

    socket.on('disconnect', async () => {
      for (const roomId of userRooms) {
        if (typingUsers[roomId]) delete typingUsers[roomId][socket.userId];
        if (recordingUsers[roomId]) delete recordingUsers[roomId][socket.userId];
        broadcastTyping(roomId);
        broadcastRecording(roomId);
        const sockets = await io.in(`room:${roomId}`).fetchSockets();
        const online = sockets.map(s => s.userId).filter(Boolean);
        io.to(`room:${roomId}`).emit('online-users', { roomId, users: online });
        socket.to(`room:${roomId}`).emit('user-left', { userId: socket.userId });
      }
    });
  });
}
