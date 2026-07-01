import db from '../config/db.js';

class Message {
  criar({ room_id, user_id, content, reply_to, expires_at }) {
    if (reply_to) {
      db.run(
        `INSERT INTO messages (room_id, user_id, content, reply_to, expires_at) VALUES (?, ?, ?, ?, ?)`,
        [room_id, user_id, content, reply_to, expires_at || null]
      );
    } else {
      db.run(
        `INSERT INTO messages (room_id, user_id, content, expires_at) VALUES (?, ?, ?, ?)`,
        [room_id, user_id, content, expires_at || null]
      );
    }
    db.run(
      `UPDATE rooms SET last_activity = datetime('now') WHERE id = ?`,
      [room_id]
    );
    return this.buscarPorId(db.get('SELECT MAX(id) as id FROM messages').id);
  }

  buscarPorId(id) {
    const msg = db.get(
      `SELECT m.*, u.nome AS user_name,
        (SELECT COUNT(*) FROM message_reads WHERE message_id = m.id) AS read_count
       FROM messages m
       JOIN usuarios u ON u.id = m.user_id
       WHERE m.id = ?`,
      [id]
    );
    if (msg) {
      msg.reactions = this.getReactions(id);
    }
    return msg;
  }

  listarPorSala(roomId, limit = 50, before = null) {
    let sql = `SELECT m.*, u.nome AS user_name,
                (SELECT COUNT(*) FROM message_reads WHERE message_id = m.id) AS read_count
               FROM messages m
               JOIN usuarios u ON u.id = m.user_id
               WHERE m.room_id = ?`;
    const params = [roomId];
    if (before) {
      sql += ` AND m.id < ?`;
      params.push(before);
    }
    sql += ` ORDER BY m.id DESC LIMIT ?`;
    params.push(limit);
    const rows = db.query(sql, params);
    const reversed = rows.reverse();
    return reversed.map(msg => {
      msg.reactions = this.getReactions(msg.id);
      return msg;
    });
  }

  checkMuted(roomId, userId) {
    const row = db.get(`SELECT is_muted, muted_until FROM room_members WHERE room_id = ? AND user_id = ?`, [roomId, userId]);
    if (!row) return false;
    if (row.is_muted) {
      if (row.muted_until && new Date(row.muted_until) < new Date()) {
        db.run(`UPDATE room_members SET is_muted = 0, muted_until = NULL WHERE room_id = ? AND user_id = ?`, [roomId, userId]);
        return false;
      }
      return true;
    }
    return false;
  }

  listarFixadas(roomId) {
    return db.query(
      `SELECT m.*, u.nome AS user_name
       FROM messages m
       JOIN usuarios u ON u.id = m.user_id
       WHERE m.room_id = ? AND m.pinned = 1
       ORDER BY m.created_at DESC
       LIMIT 10`,
      [roomId]
    ).map(msg => {
      msg.reactions = this.getReactions(msg.id);
      return msg;
    });
  }

  editar(id, userId, content) {
    const msg = db.get('SELECT * FROM messages WHERE id = ?', [id]);
    if (!msg || msg.user_id !== userId) return null;
    db.run(
      `UPDATE messages SET content = ?, edited = 1 WHERE id = ?`,
      [content, id]
    );
    return this.buscarPorId(id);
  }

  deletar(id, userId) {
    const msg = db.get('SELECT * FROM messages WHERE id = ?', [id]);
    if (!msg) return;
    if (msg.user_id === userId) {
      db.run(`DELETE FROM messages WHERE id = ?`, [id]);
    }
  }

  togglePinned(id, userId) {
    const member = db.get(
      `SELECT * FROM room_members WHERE room_id = (SELECT room_id FROM messages WHERE id = ?) AND user_id = ? AND (is_owner = 1 OR role = 'admin')`,
      [id, userId]
    );
    if (!member) return null;
    const msg = db.get('SELECT pinned FROM messages WHERE id = ?', [id]);
    if (!msg) return null;
    const newVal = msg.pinned ? 0 : 1;
    db.run(`UPDATE messages SET pinned = ? WHERE id = ?`, [newVal, id]);
    return { pinned: !!newVal };
  }

  getReactions(messageId) {
    return db.query(
      'SELECT * FROM message_reactions WHERE message_id = ?',
      [messageId]
    ) || [];
  }

  toggleReaction(messageId, userId, emoji) {
    const existing = db.get(
      'SELECT * FROM message_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?',
      [messageId, userId, emoji]
    );
    if (existing) {
      db.run('DELETE FROM message_reactions WHERE id = ?', [existing.id]);
    } else {
      db.run(
        'INSERT INTO message_reactions (message_id, user_id, emoji) VALUES (?, ?, ?)',
        [messageId, userId, emoji]
      );
    }
    return this.getReactions(messageId);
  }
}

export default new Message();
