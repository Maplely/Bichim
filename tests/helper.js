import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const SUFFIX = process.env.VITEST_WORKER_ID || '0';

export function getTestDbPath(name) {
  const dir = path.join(root, 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `test_${name}_${SUFFIX}.db`);
}

export function initTestDb(dbPath) {
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');

  const sqlPath = path.join(root, 'db', 'init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));
  for (const stmt of statements) {
    try { db.exec(stmt + ';'); } catch (e) {
      if (!e.message?.includes('already exists')) throw e;
    }
  }
  return db;
}

export function cleanTestDb(dbPath) {
  try {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  } catch { }
}

export function seedUsuario(db, overrides = {}) {
  const hash = bcrypt.hashSync(overrides.senha || 'Test1234', 10);
  const stmt = db.prepare(`
    INSERT INTO usuarios (nome, email, senha_hash, verificado, codigo_verificacao, codigo_expiracao)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    overrides.nome || 'Teste',
    overrides.email || 'teste@test.com',
    hash,
    overrides.verificado !== undefined ? (overrides.verificado ? 1 : 0) : 1,
    overrides.codigo_verificacao || null,
    overrides.codigo_expiracao || null
  );
  return db.prepare('SELECT * FROM usuarios ORDER BY id DESC LIMIT 1').get();
}

export function createRoom(db, overrides = {}) {
  const password_hash = overrides.password ? bcrypt.hashSync(overrides.password, 10) : (overrides.password_hash || null);
  db.prepare(`
    INSERT INTO rooms (name, code, password_hash, creator_id)
    VALUES (?, ?, ?, ?)
  `).run(
    overrides.name || 'Sala Teste',
    overrides.code || 'ABC123',
    password_hash,
    overrides.creator_id || 1
  );
  return db.prepare('SELECT * FROM rooms ORDER BY id DESC LIMIT 1').get();
}

export function addMember(db, room_id, user_id, is_owner = 0) {
  db.prepare('INSERT OR IGNORE INTO room_members (room_id, user_id, is_owner) VALUES (?, ?, ?)').run(room_id, user_id, is_owner ? 1 : 0);
}

export function createMessage(db, overrides = {}) {
  db.prepare(`
    INSERT INTO messages (room_id, user_id, content)
    VALUES (?, ?, ?)
  `).run(
    overrides.room_id || 1,
    overrides.user_id || 1,
    overrides.content || 'Ola'
  );
  return db.prepare('SELECT * FROM messages ORDER BY id DESC LIMIT 1').get();
}

export async function loginUser(request, email, senha) {
  const res = await request.post('/api/auth/login').send({ email, senha });
  return res.body.token;
}
