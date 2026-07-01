import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import Room from '../models/Room.js';
import db from '../config/db.js';

function genCode() {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => c[Math.floor(Math.random() * c.length)]).join('');
}

class RoomController {
  async listar(req, res) {
    try {
      const includeArchived = req.query.archived === '1';
      const rooms = await Room.listarPorUsuario(req.usuarioId, includeArchived);
      res.json(rooms);
    } catch (err) {
      console.error('Erro ao listar salas:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async criar(req, res) {
    try {
      const { name, password, description, code: providedCode, is_dm } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ erro: 'Nome da sala é obrigatório' });
      }

      const code = providedCode || genCode();
      if (!/^[A-Z0-9]{6}$/.test(code)) {
        return res.status(400).json({ erro: 'Código inválido' });
      }

      const existente = await Room.buscarPorCodigo(code);
      if (existente) {
        return res.status(409).json({ erro: 'Código já em uso. Tente novamente.' });
      }

      let password_hash = null;
      if (password && password.length > 0) {
        password_hash = await bcrypt.hash(password, 10);
      }

      const roomId = await Room.criar({
        name: name.trim(),
        code,
        password_hash,
        description: description?.trim() || null,
        creator_id: req.usuarioId,
        is_dm: !!is_dm,
      });

      const room = await Room.buscarPorId(roomId);
      const members = await Room.listarMembros(roomId);
      res.status(201).json({ ...room, is_owner: true, role: 'owner', member_count: members.length });
    } catch (err) {
      console.error('Erro ao criar sala:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async buscar(req, res) {
    try {
      const roomId = req.params.id;
      const room = await Room.buscarPorId(roomId);
      if (!room) {
        return res.status(404).json({ erro: 'Sala não encontrada' });
      }
      if (!room.is_dm && !Room.isMembro(roomId, req.usuarioId)) {
        return res.status(403).json({ erro: 'Você não é membro desta sala' });
      }
      const members = await Room.listarMembros(roomId);
      const member = await db.get(
        `SELECT is_owner, role FROM room_members WHERE room_id = ? AND user_id = ?`,
        [roomId, req.usuarioId]
      );
      res.json({ ...room, is_owner: member?.is_owner ? true : false, role: member?.role || 'member', member_count: members.length });
    } catch (err) {
      console.error('Erro ao buscar sala:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async encontrarDM(req, res) {
    try {
      const { targetUserId } = req.params;
      const me = req.usuarioId;
      const parsed = parseInt(targetUserId);
      if (!parsed || parsed === me) {
        return res.status(400).json({ erro: 'ID de usuário inválido' });
      }
      const target = db.get('SELECT id, nome FROM usuarios WHERE id = ?', [parsed]);
      if (!target) return res.status(404).json({ erro: 'Usuário não encontrado' });

      let dm = Room.buscarDM(me, parsed);
      if (dm) {
        const members = await Room.listarMembros(dm.id);
        return res.json({ ...dm, is_owner: true, role: 'owner', member_count: members.length });
      }

      const code = 'DM' + Math.random().toString(36).slice(2, 6).toUpperCase();
      const dmId = Room.criar({
        name: target.nome,
        code,
        creator_id: me,
        is_dm: true,
      });

      Room.adicionarMembro(dmId, parsed);
      const room = await Room.buscarPorId(dmId);
      const members = await Room.listarMembros(dmId);
      res.status(201).json({ ...room, is_owner: true, role: 'owner', member_count: members.length });
    } catch (err) {
      console.error('Erro ao encontrar DM:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async entrar(req, res) {
    try {
      const { code, password } = req.body;
      if (!code || !code.trim()) {
        return res.status(400).json({ erro: 'Código da sala é obrigatório' });
      }

      const codeUpper = code.trim().toUpperCase();
      const room = await Room.buscarPorCodigo(codeUpper);
      if (!room) {
        return res.status(404).json({ erro: 'Sala não encontrada' });
      }

      if (Room.isBanned(room.id, req.usuarioId)) {
        return res.status(403).json({ erro: 'Você foi banido desta sala' });
      }

      if (room.password_hash) {
        if (!password) {
          return res.status(400).json({ erro: 'Senha obrigatória para esta sala' });
        }
        const senhaOk = await bcrypt.compare(password, room.password_hash);
        if (!senhaOk) {
          return res.status(401).json({ erro: 'Senha incorreta' });
        }
      }

      if (Room.isMembro(room.id, req.usuarioId)) {
        return res.status(409).json({ erro: 'Você já está nesta sala' });
      }

      await Room.adicionarMembro(room.id, req.usuarioId);
      const members = await Room.listarMembros(room.id);
      const userName = db.get('SELECT nome FROM usuarios WHERE id = ?', [req.usuarioId])?.nome || 'Alguém';
      try { db.run(`INSERT INTO messages (room_id, user_id, content, is_system) VALUES (?, ?, ?, 1)`, [room.id, req.usuarioId, `${userName} entrou na sala! 👋`]); } catch {}

      const io = req.app.get('io');
      if (io) {
        io.to(`room:${room.id}`).emit('user-joined', { user: { id: req.usuarioId, nome: userName } });
      }

      Room.logAudit(room.id, req.usuarioId, 'join', null, 'Entrou na sala');
      res.json({ ...room, member_count: members.length });
    } catch (err) {
      console.error('Erro ao entrar na sala:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async deletar(req, res) {
    try {
      const roomId = req.params.id;
      const result = await Room.deletar(roomId, req.usuarioId);
      if (result.affectedRows === 0) {
        return res.status(403).json({ erro: 'Apenas o dono pode deletar a sala' });
      }
      const io = req.app.get('io');
      if (io) io.to(`room:${roomId}`).emit('room-deleted', { roomId });
      res.json({ mensagem: 'Sala deletada com sucesso' });
    } catch (err) {
      console.error('Erro ao deletar sala:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async membros(req, res) {
    try {
      const roomId = req.params.id;
      const members = await Room.listarMembros(roomId);
      res.json(members);
    } catch (err) {
      console.error('Erro ao listar membros:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async sair(req, res) {
    try {
      const roomId = req.params.id;
      const member = db.get(
        `SELECT is_owner FROM room_members WHERE room_id = ? AND user_id = ?`,
        [roomId, req.usuarioId]
      );
      if (!member) {
        return res.status(404).json({ erro: 'Você não é membro desta sala' });
      }
      if (member.is_owner) {
        return res.status(403).json({ erro: 'O dono não pode sair da sala. Delete a sala para removê-la.' });
      }
      Room.sair(roomId, req.usuarioId);
      const io = req.app.get('io');
      if (io) io.to(`room:${roomId}`).emit('user-left', { userId: req.usuarioId });
      res.json({ mensagem: 'Você saiu da sala' });
    } catch (err) {
      console.error('Erro ao sair da sala:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async kick(req, res) {
    try {
      const roomId = req.params.id;
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ erro: 'Usuário obrigatório' });
      const result = await Room.kickMember(roomId, req.usuarioId, userId);
      if (result.affectedRows === 0) {
        return res.status(403).json({ erro: 'Apenas o dono pode expulsar membros' });
      }
      const io = req.app.get('io');
      if (io) {
        io.to(`room:${roomId}`).emit('member-kicked', { roomId, userId });
        io.to(`room:${roomId}`).emit('user-left', { userId });
      }
      Room.logAudit(roomId, req.usuarioId, 'kick', userId, 'Membro expulso');
      res.json({ mensagem: 'Membro expulso' });
    } catch (err) {
      console.error('Erro ao expulsar:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async ban(req, res) {
    try {
      const roomId = req.params.id;
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ erro: 'Usuário obrigatório' });
      const result = await Room.banMember(roomId, req.usuarioId, userId);
      if (result.affectedRows === 0) {
        return res.status(403).json({ erro: 'Apenas o dono pode banir membros' });
      }
      const io = req.app.get('io');
      if (io) {
        io.to(`room:${roomId}`).emit('member-kicked', { roomId, userId });
        io.to(`room:${roomId}`).emit('user-left', { userId });
      }
      Room.logAudit(roomId, req.usuarioId, 'ban', userId, 'Membro banido');
      res.json({ mensagem: 'Membro banido' });
    } catch (err) {
      console.error('Erro ao banir:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async unban(req, res) {
    try {
      const roomId = req.params.id;
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ erro: 'Usuário obrigatório' });
      const result = await Room.unbanMember(roomId, req.usuarioId, userId);
      if (result.affectedRows === 0) {
        return res.status(403).json({ erro: 'Não autorizado' });
      }
      const io = req.app.get('io');
      if (io) io.to(`room:${roomId}`).emit('user-unbanned', { roomId, userId });
      Room.logAudit(roomId, req.usuarioId, 'unban', userId, 'Membro desbanido');
      res.json({ mensagem: 'Membro desbanido' });
    } catch (err) {
      console.error('Erro ao desbanir:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async arquivar(req, res) {
    try {
      const roomId = req.params.id;
      const result = await Room.arquivar(roomId, req.usuarioId);
      if (result.affectedRows === 0) {
        return res.status(403).json({ erro: 'Apenas o dono pode arquivar' });
      }
      const io = req.app.get('io');
      if (io) io.to(`room:${roomId}`).emit('room-archived', { roomId, archived: result.archived });
      res.json({ archived: result.archived });
    } catch (err) {
      console.error('Erro ao arquivar:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async atualizarRole(req, res) {
    try {
      const roomId = req.params.id;
      const { userId, role } = req.body;
      if (!userId || !role) return res.status(400).json({ erro: 'userId e role obrigatórios' });
      const result = await Room.atualizarRole(roomId, req.usuarioId, userId, role);
      if (result.affectedRows === 0) {
        return res.status(403).json({ erro: 'Não autorizado' });
      }
      const io = req.app.get('io');
      if (io) io.to(`room:${roomId}`).emit('member-role-updated', { roomId, userId, role });
      Room.logAudit(roomId, req.usuarioId, 'role', userId, `Cargo alterado para ${role}`);
      res.json({ mensagem: `Cargo atualizado para ${role}` });
    } catch (err) {
      console.error('Erro ao atualizar cargo:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async searchMessages(req, res) {
    try {
      const roomId = req.params.id;
      const { q } = req.query;
      if (!q || !q.trim()) return res.json([]);
      const messages = db.query(
        `SELECT m.*, u.nome AS user_name
         FROM messages m
         JOIN usuarios u ON u.id = m.user_id
         WHERE m.room_id = ? AND m.content LIKE ?
         ORDER BY m.created_at DESC
         LIMIT 30`,
        [roomId, `%${q.trim()}%`]
      );
      res.json(messages);
    } catch (err) {
      console.error('Erro ao pesquisar:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async transferir(req, res) {
    try {
      const roomId = req.params.id;
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ erro: 'userId obrigatório' });
      const result = await Room.transferOwnership(roomId, req.usuarioId, userId);
      if (result.affectedRows === 0) return res.status(403).json({ erro: 'Não autorizado' });
      const io = req.app.get('io');
      if (io) io.to(`room:${roomId}`).emit('ownership-transferred', { roomId, newOwnerId: userId });
      Room.logAudit(roomId, req.usuarioId, 'transfer', userId, 'Posse transferida');
      res.json({ mensagem: 'Posse transferida com sucesso' });
    } catch (err) {
      console.error('Erro ao transferir:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async auditLog(req, res) {
    try {
      const roomId = req.params.id;
      const member = db.get(
        `SELECT * FROM room_members WHERE room_id = ? AND user_id = ? AND (is_owner = 1 OR role = 'admin')`,
        [roomId, req.usuarioId]
      );
      if (!member) return res.status(403).json({ erro: 'Apenas admin pode ver logs' });
      const logs = Room.getAuditLog(roomId);
      res.json(logs);
    } catch (err) {
      console.error('Erro ao buscar logs:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async profilo(req, res) {
    try {
      const { userId } = req.params;
      const user = db.get(
        `SELECT id, nome, email, bio, status, created_at FROM usuarios WHERE id = ?`,
        [userId]
      );
      if (!user) return res.status(404).json({ erro: 'Usuário não encontrado' });
      const roomCount = db.get(
        `SELECT COUNT(*) as count FROM room_members WHERE user_id = ?`,
        [userId]
      );
      user.room_count = roomCount?.count || 0;
      res.json(user);
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async updateProfile(req, res) {
    try {
      const { bio, status } = req.body;
      if (bio !== undefined) db.run(`UPDATE usuarios SET bio = ? WHERE id = ?`, [bio, req.usuarioId]);
      if (status !== undefined) db.run(`UPDATE usuarios SET status = ? WHERE id = ?`, [status, req.usuarioId]);
      res.json({ mensagem: 'Perfil atualizado' });
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async toggleFavorite(req, res) {
    try {
      const { id } = req.params;
      const row = db.get(`SELECT is_favorite FROM room_members WHERE room_id = ? AND user_id = ?`, [id, req.usuarioId]);
      if (!row) return res.status(404).json({ erro: 'Membro não encontrado' });
      const fav = row.is_favorite ? 0 : 1;
      db.run(`UPDATE room_members SET is_favorite = ? WHERE room_id = ? AND user_id = ?`, [fav, id, req.usuarioId]);
      res.json({ is_favorite: !!fav });
    } catch (err) {
      console.error('Erro ao favoritar:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async setSlowMode(req, res) {
    try {
      const { id } = req.params;
      const { seconds } = req.body;
      const member = db.get(`SELECT role FROM room_members WHERE room_id = ? AND user_id = ?`, [id, req.usuarioId]);
      if (!member || member.role === 'member') return res.status(403).json({ erro: 'Sem permissão' });
      const s = Math.max(0, parseInt(seconds) || 0);
      db.run(`UPDATE rooms SET slow_mode = ? WHERE id = ?`, [s, id]);
      const io = req.app.get('io');
      if (io) io.to(`room:${id}`).emit('room-slow-mode', { roomId: id, slow_mode: s });
      res.json({ slow_mode: s });
    } catch (err) {
      console.error('Erro ao definir slow mode:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async setCategory(req, res) {
    try {
      const { id } = req.params;
      const { category } = req.body;
      const member = db.get(`SELECT role FROM room_members WHERE room_id = ? AND user_id = ?`, [id, req.usuarioId]);
      if (!member || member.role === 'member') return res.status(403).json({ erro: 'Sem permissão' });
      db.run(`UPDATE rooms SET category = ? WHERE id = ?`, [category, id]);
      const io = req.app.get('io');
      if (io) io.to(`room:${id}`).emit('room-category', { roomId: id, category });
      res.json({ category });
    } catch (err) {
      console.error('Erro ao definir categoria:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async createInvite(req, res) {
    try {
      const { id } = req.params;
      const { expires_in_hours, max_uses } = req.body;
      const member = db.get(`SELECT role FROM room_members WHERE room_id = ? AND user_id = ?`, [id, req.usuarioId]);
      if (!member) return res.status(403).json({ erro: 'Sem permissão' });
      const code = crypto.randomBytes(4).toString('hex');
      const expires_at = expires_in_hours ? new Date(Date.now() + parseInt(expires_in_hours) * 3600000).toISOString() : null;
      db.run(`UPDATE rooms SET invite_code = ?, invite_expires_at = ?, invite_max_uses = ?, invite_uses = 0 WHERE id = ?`, [code, expires_at, parseInt(max_uses) || 0, id]);
      const host = req.get('host') || 'localhost:3000';
      res.json({ invite_link: `${req.protocol}://${host}/join/${code}`, code, expires_at, max_uses: parseInt(max_uses) || 0 });
    } catch (err) {
      console.error('Erro ao criar convite:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async joinByInvite(req, res) {
    try {
      const { code } = req.params;
      const room = db.get(`SELECT * FROM rooms WHERE invite_code = ?`, [code]);
      if (!room) return res.status(404).json({ erro: 'Convite inválido' });
      if (room.invite_expires_at && new Date(room.invite_expires_at) < new Date()) return res.status(410).json({ erro: 'Convite expirado' });
      if (room.invite_max_uses > 0 && room.invite_uses >= room.invite_max_uses) return res.status(410).json({ erro: 'Convite esgotado' });
      const existing = db.get(`SELECT * FROM room_members WHERE room_id = ? AND user_id = ?`, [room.id, req.usuarioId]);
      if (!existing) {
        db.run(`INSERT INTO room_members (room_id, user_id, role) VALUES (?, ?, 'member')`, [room.id, req.usuarioId]);
        db.run(`UPDATE rooms SET invite_uses = invite_uses + 1 WHERE id = ?`, [room.id]);
        const io = req.app.get('io');
        if (io) io.to(`room:${room.id}`).emit('user-joined', { user: { id: req.usuarioId } });
      }
      res.json({ room_id: room.id, name: room.name });
    } catch (err) {
      console.error('Erro ao entrar por convite:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async blockUser(req, res) {
    try {
      const { blocked_id } = req.body;
      if (!blocked_id || blocked_id === req.usuarioId) return res.status(400).json({ erro: 'ID inválido' });
      const existing = db.get(`SELECT * FROM blocked_users WHERE user_id = ? AND blocked_id = ?`, [req.usuarioId, blocked_id]);
      if (existing) {
        db.run(`DELETE FROM blocked_users WHERE user_id = ? AND blocked_id = ?`, [req.usuarioId, blocked_id]);
        return res.json({ blocked: false });
      }
      db.run(`INSERT OR IGNORE INTO blocked_users (user_id, blocked_id) VALUES (?, ?)`, [req.usuarioId, blocked_id]);
      res.json({ blocked: true });
    } catch (err) {
      console.error('Erro ao bloquear:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async reportMessage(req, res) {
    try {
      const { message_id, reason } = req.body;
      if (!message_id) return res.status(400).json({ erro: 'ID da mensagem obrigatório' });
      const msg = db.get(`SELECT * FROM messages WHERE id = ?`, [message_id]);
      if (!msg) return res.status(404).json({ erro: 'Mensagem não encontrada' });
      db.run(`INSERT INTO audit_log (room_id, user_id, action, target_id, details) VALUES (?, ?, 'report', ?, ?)`,
        [msg.room_id, req.usuarioId, message_id, reason || 'Mensagem reportada']);
      res.json({ mensagem: 'Reportado com sucesso' });
    } catch (err) {
      console.error('Erro ao reportar:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async toggleContact(req, res) {
    try {
      const { contact_id } = req.body;
      if (!contact_id || contact_id === req.usuarioId) return res.status(400).json({ erro: 'ID inválido' });
      const existing = db.get(`SELECT * FROM user_contacts WHERE user_id = ? AND contact_id = ?`, [req.usuarioId, contact_id]);
      if (existing) {
        db.run(`DELETE FROM user_contacts WHERE user_id = ? AND contact_id = ?`, [req.usuarioId, contact_id]);
        return res.json({ connected: false });
      }
      db.run(`INSERT OR IGNORE INTO user_contacts (user_id, contact_id) VALUES (?, ?)`, [req.usuarioId, contact_id]);
      res.json({ connected: true });
    } catch (err) {
      console.error('Erro ao gerenciar contato:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async listContacts(req, res) {
    try {
      const contacts = db.query(`SELECT u.id, u.nome, u.bio, u.status, u.created_at FROM user_contacts uc JOIN usuarios u ON u.id = uc.contact_id WHERE uc.user_id = ? AND uc.status = 'accepted'`, [req.usuarioId]);
      res.json(contacts);
    } catch (err) {
      console.error('Erro ao listar contatos:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async muteUser(req, res) {
    try {
      const { id } = req.params;
      const { duration_minutes } = req.body;
      const d = parseInt(duration_minutes) || 5;
      const member = db.get(`SELECT role FROM room_members WHERE room_id = ? AND user_id = ?`, [id, req.usuarioId]);
      if (!member || member.role === 'member') return res.status(403).json({ erro: 'Sem permissão' });
      const { target_id } = req.body;
      if (!target_id) return res.status(400).json({ erro: 'target_id obrigatório' });
      const muted_until = new Date(Date.now() + d * 60000).toISOString();
      db.run(`UPDATE room_members SET is_muted = 1, muted_until = ? WHERE room_id = ? AND user_id = ?`, [muted_until, id, target_id]);
      const io = req.app.get('io');
      if (io) io.to(`room:${id}`).emit('user-muted', { roomId: id, userId: target_id, muted_until });
      Room.logAudit(id, req.usuarioId, 'mute', target_id, `Silenciado por ${d} min`);
      res.json({ muted: true, muted_until });
    } catch (err) {
      console.error('Erro ao silenciar:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async unmuteUser(req, res) {
    try {
      const { id } = req.params;
      const { target_id } = req.body;
      const member = db.get(`SELECT role FROM room_members WHERE room_id = ? AND user_id = ?`, [id, req.usuarioId]);
      if (!member || member.role === 'member') return res.status(403).json({ erro: 'Sem permissão' });
      db.run(`UPDATE room_members SET is_muted = 0, muted_until = NULL WHERE room_id = ? AND user_id = ?`, [id, target_id]);
      const io = req.app.get('io');
      if (io) io.to(`room:${id}`).emit('user-unmuted', { roomId: id, userId: target_id });
      Room.logAudit(id, req.usuarioId, 'unmute', target_id, 'Silenciamento removido');
      res.json({ muted: false });
    } catch (err) {
      console.error('Erro ao dessilenciar:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async setVerification(req, res) {
    try {
      const { user_id, level } = req.body;
      if (!user_id || level === undefined) return res.status(400).json({ erro: 'user_id e level obrigatórios' });
      if (user_id !== req.usuarioId) {
        const isAdmin = db.get(
          `SELECT 1 FROM room_members WHERE user_id = ? AND (is_owner = 1 OR role = 'admin') LIMIT 1`,
          [req.usuarioId]
        );
        if (!isAdmin) return res.status(403).json({ erro: 'Sem permissão para alterar nível de outros usuários' });
      }
      const target = db.get(`SELECT * FROM usuarios WHERE id = ?`, [user_id]);
      if (!target) return res.status(404).json({ erro: 'Usuário não encontrado' });
      db.run(`UPDATE usuarios SET verification_level = ? WHERE id = ?`, [Math.max(0, Math.min(3, parseInt(level) || 0)), user_id]);
      res.json({ verification_level: parseInt(level) || 0 });
    } catch (err) {
      console.error('Erro ao definir verificação:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async createPoll(req, res) {
    try {
      const { id } = req.params;
      const { question, options } = req.body;
      if (!question || !options || !Array.isArray(options) || options.length < 2) return res.status(400).json({ erro: 'Pergunta e pelo menos 2 opções são obrigatórias' });
      const pollId = db.run(`INSERT INTO polls (room_id, question, created_by) VALUES (?, ?, ?)`, [id, question, req.usuarioId]).insertId;
      options.forEach(opt => db.run(`INSERT INTO poll_options (poll_id, text) VALUES (?, ?)`, [pollId, opt]));
      const poll = db.get(`SELECT * FROM polls WHERE id = ?`, [pollId]);
      poll.options = db.query(`SELECT * FROM poll_options WHERE poll_id = ?`, [pollId]);
      poll.votes = [];
      db.run(`UPDATE rooms SET last_activity = datetime('now') WHERE id = ?`, [id]);
      const io = req.app.get('io');
      if (io) io.to(`room:${id}`).emit('poll-created', poll);
      res.status(201).json(poll);
    } catch (err) {
      console.error('Erro ao criar enquete:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async votePoll(req, res) {
    try {
      const { id } = req.params;
      const { option_id, roomId } = req.body;
      const poll = db.get(`SELECT * FROM polls WHERE id = ?`, [id]);
      if (!poll) return res.status(404).json({ erro: 'Enquete não encontrada' });
      if (poll.is_closed) return res.status(400).json({ erro: 'Enquete encerrada' });
      const existing = db.get(`SELECT * FROM poll_votes WHERE poll_id = ? AND user_id = ?`, [id, req.usuarioId]);
      const targetRoomId = roomId || poll.room_id;
      if (existing) {
        db.run(`DELETE FROM poll_votes WHERE id = ?`, [existing.id]);
        if (existing.option_id === option_id) {
          const io = req.app.get('io');
          if (io) io.to(`room:${targetRoomId}`).emit('poll-update', { pollId: parseInt(id), optionId: option_id, userId: req.usuarioId, removed: true });
          return res.json(this.getPollData(id));
        }
      }
      db.run(`INSERT OR REPLACE INTO poll_votes (poll_id, option_id, user_id) VALUES (?, ?, ?)`, [id, option_id, req.usuarioId]);
      const io = req.app.get('io');
      if (io) io.to(`room:${targetRoomId}`).emit('poll-update', { pollId: parseInt(id), optionId: option_id, userId: req.usuarioId });
      res.json(this.getPollData(id));
    } catch (err) {
      console.error('Erro ao votar:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  getPollData(pollId) {
    const poll = db.get(`SELECT * FROM polls WHERE id = ?`, [pollId]);
    if (!poll) return null;
    poll.options = db.query(`SELECT po.*, (SELECT COUNT(*) FROM poll_votes WHERE option_id = po.id) AS votes FROM poll_options po WHERE po.poll_id = ?`, [pollId]);
    poll.total_votes = poll.options.reduce((sum, o) => sum + o.votes, 0);
    return poll;
  }

  async getPoll(req, res) {
    try {
      const { id } = req.params;
      const poll = this.getPollData(id);
      if (!poll) return res.status(404).json({ erro: 'Enquete não encontrada' });
      res.json(poll);
    } catch (err) {
      console.error('Erro ao buscar enquete:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async scheduleMessage(req, res) {
    try {
      const { id } = req.params;
      const { content, scheduled_at } = req.body;
      if (!content?.trim() || !scheduled_at) return res.status(400).json({ erro: 'Conteúdo e data/hora obrigatórios' });
      db.run(`INSERT INTO scheduled_messages (room_id, user_id, content, scheduled_at) VALUES (?, ?, ?, ?)`, [id, req.usuarioId, content, scheduled_at]);
      res.status(201).json({ mensagem: 'Mensagem agendada' });
    } catch (err) {
      console.error('Erro ao agendar mensagem:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async setDisappear(req, res) {
    try {
      const { id } = req.params;
      const { seconds } = req.body;
      const member = db.get(`SELECT role FROM room_members WHERE room_id = ? AND user_id = ?`, [id, req.usuarioId]);
      if (!member || member.role === 'member') return res.status(403).json({ erro: 'Sem permissão' });
      Room.setDisappearAfter(id, parseInt(seconds) || 0);
      const io = req.app.get('io');
      if (io) io.to(`room:${id}`).emit('room-disappear-updated', { roomId: id, disappear_after: parseInt(seconds) || 0 });
      res.json({ disappear_after: parseInt(seconds) || 0 });
    } catch (err) {
      console.error('Erro ao definir auto-destruição:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async translateMessage(req, res) {
    try {
      const { text, target_lang } = req.body;
      if (!text?.trim()) return res.status(400).json({ erro: 'Texto obrigatório' });
      const lang = target_lang || 'pt-br';
      const r = await fetch(`https://lingva.ml/api/v1/auto/${encodeURIComponent(lang)}/${encodeURIComponent(text)}`);
      if (r.ok) {
        const data = await r.json();
        return res.json({ translated: data.translation, source_lang: data.info?.detected?.language || 'auto' });
      }
      const r2 = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(lang)}&dt=t&q=${encodeURIComponent(text)}`);
      if (r2.ok) {
        const data = await r2.json();
        return res.json({ translated: data[0]?.map(t => t[0]).join('') || text, source_lang: data[2] || 'auto' });
      }
      res.json({ translated: `[tradução indisponível] ${text}`, source_lang: 'auto' });
    } catch (err) {
      console.error('Erro ao traduzir:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }
}

export default new RoomController();
