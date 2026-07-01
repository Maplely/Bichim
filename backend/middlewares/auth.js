import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'dev-secret-' + Math.random().toString(36).slice(2);
}
const JWT_SECRET = process.env.JWT_SECRET;

const userCache = new Map();
const CACHE_TTL = 60 * 1000;
const CACHE_MAX = 1000;

function getCachedUser(id) {
  const cached = userCache.get(id);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedUser(id, data) {
  if (userCache.size >= CACHE_MAX) {
    const oldest = userCache.entries().next().value;
    if (oldest) userCache.delete(oldest[0]);
  }
  userCache.set(id, { data, timestamp: Date.now() });
}

function clearUserCache(id) {
  userCache.delete(id);
}

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, token_version: usuario.token_version || 0 },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function extrairToken(req) {
  const header = req.headers.authorization;
  if (header) {
    return header.startsWith('Bearer ') ? header.slice(7) : header;
  }
  return req.cookies?.token || null;
}

async function verificarToken(req, res, next) {
  const token = extrairToken(req);
  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }

  let usuario = getCachedUser(decoded.id);
  if (usuario && usuario.token_version !== decoded.token_version) {
    clearUserCache(decoded.id);
    usuario = null;
  }
  if (!usuario) {
    usuario = await Usuario.buscarPorId(decoded.id);
    if (!usuario) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }
    setCachedUser(decoded.id, usuario);
  }

  if (usuario.token_version !== decoded.token_version) {
    return res.status(401).json({ erro: 'Sessão expirada. Faça login novamente.' });
  }

  req.usuarioId = decoded.id;
  req.usuarioEmail = decoded.email;
  next();
}

export { gerarToken, verificarToken, clearUserCache, JWT_SECRET };
