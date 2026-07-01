import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');

const dbPath = path.resolve(root, process.env.DATABASE_PATH || './data/chat.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

class DatabaseWrapper {
  constructor() {
    this.db = new DatabaseSync(dbPath);
    this.db.exec('PRAGMA journal_mode = WAL');
    this.db.exec('PRAGMA foreign_keys = ON');
    this.migrate();
  }

  migrate() {
    this.db.exec(`CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, email TEXT UNIQUE NOT NULL, senha_hash TEXT NOT NULL, codigo_verificacao TEXT, codigo_expiracao TEXT, verificado INTEGER DEFAULT 0, token_version INTEGER DEFAULT 0, bio TEXT, status TEXT DEFAULT 'online', verification_level INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS rooms (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, code TEXT UNIQUE NOT NULL, password_hash TEXT, description TEXT, is_dm INTEGER DEFAULT 0, is_announcement INTEGER DEFAULT 0, creator_id INTEGER NOT NULL REFERENCES usuarios(id), last_activity TEXT DEFAULT (datetime('now')), slow_mode INTEGER DEFAULT 0, category TEXT, banner_url TEXT, invite_expires_at TEXT, invite_max_uses INTEGER DEFAULT 0, invite_uses INTEGER DEFAULT 0, disappear_after INTEGER DEFAULT 0, archived INTEGER DEFAULT 0, invite_code TEXT, created_at TEXT DEFAULT (datetime('now')))`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS room_members (room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE, user_id INTEGER NOT NULL REFERENCES usuarios(id), is_owner INTEGER DEFAULT 0, role TEXT DEFAULT 'member', is_banned INTEGER DEFAULT 0, is_muted INTEGER DEFAULT 0, muted_until TEXT, is_favorite INTEGER DEFAULT 0, joined_at TEXT DEFAULT (datetime('now')), PRIMARY KEY (room_id, user_id))`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE, user_id INTEGER NOT NULL REFERENCES usuarios(id), content TEXT NOT NULL, reply_to INTEGER, edited INTEGER DEFAULT 0, pinned INTEGER DEFAULT 0, file_url TEXT, file_name TEXT, file_size INTEGER, file_type TEXT, is_system INTEGER DEFAULT 0, expires_at TEXT, created_at TEXT DEFAULT (datetime('now')))`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS message_reactions (id INTEGER PRIMARY KEY AUTOINCREMENT, message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE, user_id INTEGER NOT NULL REFERENCES usuarios(id), emoji TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS saved_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, message_id INTEGER NOT NULL, room_id INTEGER NOT NULL, created_at TEXT DEFAULT (datetime('now')), UNIQUE(user_id, message_id))`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, room_id INTEGER NOT NULL, user_id INTEGER NOT NULL, action TEXT NOT NULL, target_id INTEGER, details TEXT, created_at TEXT DEFAULT (datetime('now')))`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS blocked_users (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, blocked_id INTEGER NOT NULL, created_at TEXT DEFAULT (datetime('now')), UNIQUE(user_id, blocked_id))`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS user_contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, contact_id INTEGER NOT NULL, status TEXT DEFAULT 'pending', created_at TEXT DEFAULT (datetime('now')), UNIQUE(user_id, contact_id))`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS message_reads (id INTEGER PRIMARY KEY AUTOINCREMENT, message_id INTEGER NOT NULL, user_id INTEGER NOT NULL, room_id INTEGER NOT NULL, read_at TEXT DEFAULT (datetime('now')), UNIQUE(message_id, user_id))`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS polls (id INTEGER PRIMARY KEY AUTOINCREMENT, room_id INTEGER NOT NULL, question TEXT NOT NULL, created_by INTEGER NOT NULL, is_closed INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS poll_options (id INTEGER PRIMARY KEY AUTOINCREMENT, poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE, text TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS poll_votes (id INTEGER PRIMARY KEY AUTOINCREMENT, poll_id INTEGER NOT NULL, option_id INTEGER NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE, user_id INTEGER NOT NULL, created_at TEXT DEFAULT (datetime('now')), UNIQUE(poll_id, user_id))`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS scheduled_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, room_id INTEGER NOT NULL, user_id INTEGER NOT NULL, content TEXT NOT NULL, scheduled_at TEXT NOT NULL, sent INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_room_members_room ON room_members(room_id)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_room_members_user ON room_members(user_id)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_messages(user_id)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_room ON audit_log(room_id)`);
  }

  prepare(sql) {
    return this.db.prepare(sql);
  }

  query(sql, params = []) {
    const upper = sql.trim().toUpperCase();
    const stmt = this.db.prepare(sql);
    if (upper.startsWith('SELECT') || upper.startsWith('WITH') || upper.startsWith('PRAGMA')) {
      return stmt.all(...params);
    }
    const result = stmt.run(...params);
    return { affectedRows: Number(result.changes), insertId: Number(result.lastInsertRowid) };
  }

  get(sql, params = []) {
    const stmt = this.db.prepare(sql);
    return stmt.get(...params) || null;
  }

  run(sql, params = []) {
    const stmt = this.db.prepare(sql);
    const result = stmt.run(...params);
    return { affectedRows: Number(result.changes), insertId: Number(result.lastInsertRowid) };
  }

  transaction(fn) {
    this.db.exec('BEGIN');
    try {
      const result = fn();
      this.db.exec('COMMIT');
      return result;
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
  }

  close() {
    this.db.close();
  }
}

export default new DatabaseWrapper();
