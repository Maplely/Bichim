import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const envPath = path.join(root, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

const dbPath = process.env.DATABASE_PATH || './data/chat.db';
const dbDir = path.dirname(path.resolve(root, dbPath));

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`[init-db] Diretório criado: ${dbDir}`);
}

const sqlPath = path.join(root, 'db', 'init.sql');
const sql = fs.readFileSync(sqlPath, 'utf-8');

try {
  const db = new DatabaseSync(path.resolve(root, dbPath));
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');

  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const stmt of statements) {
    try {
      db.exec(stmt + ';');
    } catch (err) {
      if (!err.message?.includes('already exists')) {
        console.error(`[init-db] Erro: ${err.message}`);
      }
    }
  }

  console.log('[init-db] Banco de dados inicializado com sucesso!');
  db.close();
} catch (err) {
  console.error('[init-db] Erro ao inicializar banco:', err.message);
  process.exit(1);
}
