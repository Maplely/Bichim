import db from '../config/db.js';

class Room {
  criar({ name, code, password_hash, description, creator_id, is_dm }) {
    return db.transaction(() => {
      const result = db.run(
        `INSERT INTO rooms (name, code, password_hash, description, creator_id, is_dm) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, code, password_hash || null, description || null, creator_id, is_dm ? 1 : 0]
      );
      const roomId = result.insertId;
      db.run(
        `INSERT INTO room_members (room_id, user_id, is_owner, role) VALUES (?, ?, 1, 'owner')`,
        [roomId, creator_id]
      );
      return roomId;
    });
  }

  buscarDM(userId1, userId2) {
    return db.get(`
      SELECT r.* FROM rooms r
      WHERE r.is_dm = 1 AND (
        SELECT COUNT(*) FROM room_members WHERE room_id = r.id AND user_id IN (?, ?)
      ) = 2 AND (
        SELECT COUNT(*) FROM room_members WHERE room_id = r.id
      ) = 2
      ORDER BY r.last_activity DESC LIMIT 1
    `, [userId1, userId2]);
  }

  buscarPorId(id) {
    return db.get(`SELECT * FROM rooms WHERE id = ?`, [id]);
  }

  buscarPorCodigo(code) {
    return db.get(`SELECT * FROM rooms WHERE code = ?`, [code]);
  }

  listarPorUsuario(userId, includeArchived = false) {
    let sql = `SELECT r.*, rm.is_owner, rm.role, rm.is_favorite,
        (SELECT COUNT(*) FROM room_members WHERE room_id = r.id) AS member_count
       FROM rooms r
       JOIN room_members rm ON rm.room_id = r.id
       WHERE rm.user_id = ? AND rm.is_banned = 0`;
    if (!includeArchived) sql += ` AND r.archived = 0`;
    sql += ` ORDER BY r.is_dm ASC, r.last_activity DESC`;
    return db.query(sql, [userId]);
  }

  deletar(id, userId) {
    const room = this.buscarPorId(id);
    if (!room) return { affectedRows: 0 };
    const member = db.get(
      `SELECT * FROM room_members WHERE room_id = ? AND user_id = ? AND is_owner = 1`,
      [id, userId]
    );
    if (!member) return { affectedRows: 0 };
    const result = db.run(`DELETE FROM rooms WHERE id = ?`, [id]);
    return { affectedRows: result.affectedRows };
  }

  isMembro(roomId, userId) {
    const row = db.get(
      `SELECT 1 FROM room_members WHERE room_id = ? AND user_id = ? AND is_banned = 0`,
      [roomId, userId]
    );
    return !!row;
  }

  adicionarMembro(roomId, userId) {
    try {
      db.run(
        `INSERT OR IGNORE INTO room_members (room_id, user_id) VALUES (?, ?)`,
        [roomId, userId]
      );
      return true;
    } catch {
      return false;
    }
  }

  sair(roomId, userId) {
    db.run(
      `DELETE FROM room_members WHERE room_id = ? AND user_id = ?`,
      [roomId, userId]
    );
  }

  kickMember(roomId, ownerId, targetUserId) {
    const owner = db.get(
      `SELECT * FROM room_members WHERE room_id = ? AND user_id = ? AND is_owner = 1`,
      [roomId, ownerId]
    );
    if (!owner) return { affectedRows: 0 };
    const result = db.run(
      `DELETE FROM room_members WHERE room_id = ? AND user_id = ? AND is_owner = 0`,
      [roomId, targetUserId]
    );
    return { affectedRows: result.affectedRows };
  }

  banMember(roomId, ownerId, targetUserId) {
    const owner = db.get(
      `SELECT * FROM room_members WHERE room_id = ? AND user_id = ? AND is_owner = 1`,
      [roomId, ownerId]
    );
    if (!owner) return { affectedRows: 0 };
    db.run(
      `UPDATE room_members SET is_banned = 1 WHERE room_id = ? AND user_id = ? AND is_owner = 0`,
      [roomId, targetUserId]
    );
    return { affectedRows: 1 };
  }

  unbanMember(roomId, ownerId, targetUserId) {
    const owner = db.get(
      `SELECT * FROM room_members WHERE room_id = ? AND user_id = ? AND is_owner = 1`,
      [roomId, ownerId]
    );
    if (!owner) return { affectedRows: 0 };
    const result = db.run(
      `UPDATE room_members SET is_banned = 0 WHERE room_id = ? AND user_id = ?`,
      [roomId, targetUserId]
    );
    return { affectedRows: result.affectedRows };
  }

  isBanned(roomId, userId) {
    const row = db.get(
      `SELECT 1 FROM room_members WHERE room_id = ? AND user_id = ? AND is_banned = 1`,
      [roomId, userId]
    );
    return !!row;
  }

  atualizarAtividade(roomId) {
    db.run(
      `UPDATE rooms SET last_activity = datetime('now') WHERE id = ?`,
      [roomId]
    );
  }

  expirarInativas() {
    const result = db.run(
      `DELETE FROM rooms WHERE last_activity < datetime('now', '-24 hours') AND is_dm = 0`
    );
    return result.affectedRows;
  }

  listarMembros(roomId) {
    return db.query(
      `SELECT u.id, u.nome, u.email, u.bio, u.status,
        rm.is_owner, rm.role, rm.is_banned,
        rm.joined_at
       FROM room_members rm
       JOIN usuarios u ON u.id = rm.user_id
       WHERE rm.room_id = ?`,
      [roomId]
    );
  }

  atualizarRole(roomId, ownerId, targetUserId, role) {
    const owner = db.get(
      `SELECT * FROM room_members WHERE room_id = ? AND user_id = ? AND is_owner = 1`,
      [roomId, ownerId]
    );
    if (!owner) return { affectedRows: 0 };
    if (role === 'owner') return { affectedRows: 0 };
    const validRoles = ['admin', 'member'];
    if (!validRoles.includes(role)) return { affectedRows: 0 };
    db.run(
      `UPDATE room_members SET role = ? WHERE room_id = ? AND user_id = ? AND is_owner = 0`,
      [role, roomId, targetUserId]
    );
    return { affectedRows: 1 };
  }

  arquivar(roomId, userId) {
    const member = db.get(
      `SELECT * FROM room_members WHERE room_id = ? AND user_id = ? AND is_owner = 1`,
      [roomId, userId]
    );
    if (!member) return { affectedRows: 0 };
    const room = this.buscarPorId(roomId);
    const newVal = room.archived ? 0 : 1;
    db.run(`UPDATE rooms SET archived = ? WHERE id = ?`, [newVal, roomId]);
    return { affectedRows: 1, archived: !!newVal };
  }

  transferOwnership(roomId, ownerId, targetUserId) {
    return db.transaction(() => {
      const owner = db.get(
        `SELECT * FROM room_members WHERE room_id = ? AND user_id = ? AND is_owner = 1`,
        [roomId, ownerId]
      );
      if (!owner) return { affectedRows: 0 };
      const target = db.get(
        `SELECT * FROM room_members WHERE room_id = ? AND user_id = ?`,
        [roomId, targetUserId]
      );
      if (!target) return { affectedRows: 0 };
      db.run(
        `UPDATE room_members SET is_owner = 0, role = 'admin' WHERE room_id = ? AND user_id = ?`,
        [roomId, ownerId]
      );
      db.run(
        `UPDATE room_members SET is_owner = 1, role = 'owner' WHERE room_id = ? AND user_id = ?`,
        [roomId, targetUserId]
      );
      db.run(`UPDATE rooms SET creator_id = ? WHERE id = ?`, [targetUserId, roomId]);
      return { affectedRows: 1 };
    });
  }

  logAudit(roomId, userId, action, targetId, details) {
    db.run(
      `INSERT INTO audit_log (room_id, user_id, action, target_id, details) VALUES (?, ?, ?, ?, ?)`,
      [roomId, userId, action, targetId, details || null]
    );
  }

  getAuditLog(roomId, limit = 50) {
    return db.query(
      `SELECT a.*, u.nome AS user_name, t.nome AS target_name
       FROM audit_log a
       LEFT JOIN usuarios u ON u.id = a.user_id
       LEFT JOIN usuarios t ON t.id = a.target_id
       WHERE a.room_id = ?
       ORDER BY a.created_at DESC LIMIT ?`,
      [roomId, limit]
    );
  }

  setSlowMode(roomId, userId, seconds) {
    const member = db.get(
      `SELECT * FROM room_members WHERE room_id = ? AND user_id = ? AND (is_owner = 1 OR role = 'admin')`,
      [roomId, userId]
    );
    if (!member) return { affectedRows: 0 };
    db.run(`UPDATE rooms SET slow_mode = ? WHERE id = ?`, [seconds || 0, roomId]);
    return { affectedRows: 1, slow_mode: seconds || 0 };
  }

  setDisappearAfter(roomId, seconds) {
    db.run(`UPDATE rooms SET disappear_after = ? WHERE id = ?`, [seconds || 0, roomId]);
  }

  getExpiredMessages() {
    return db.query(`SELECT * FROM messages WHERE expires_at IS NOT NULL AND expires_at <= datetime('now')`);
  }

  deleteExpiredMessages() {
    const expired = this.getExpiredMessages();
    if (expired.length === 0) return 0;
    const ids = expired.map(m => m.id);
    const placeholders = ids.map(() => '?').join(',');
    db.run(`DELETE FROM messages WHERE id IN (${placeholders})`, ids);
    return ids.length;
  }

  getPendingScheduled() {
    return db.query(`SELECT * FROM scheduled_messages WHERE sent = 0 AND scheduled_at <= datetime('now')`);
  }

  sendScheduledMessage(row) {
    const room = this.buscarPorId(row.room_id);
    const expires_at = room?.disappear_after > 0 ? new Date(Date.now() + room.disappear_after * 1000).toISOString() : null;
    if (expires_at) {
      db.run(`INSERT INTO messages (room_id, user_id, content, expires_at) VALUES (?, ?, ?, ?)`, [row.room_id, row.user_id, row.content, expires_at]);
    } else {
      db.run(`INSERT INTO messages (room_id, user_id, content) VALUES (?, ?, ?)`, [row.room_id, row.user_id, row.content]);
    }
    db.run(`UPDATE scheduled_messages SET sent = 1 WHERE id = ?`, [row.id]);
  }
}

export default new Room();
