const store = new Map();
const WINDOW = 60000;
const MAX = 60;
const CLEANUP_INTERVAL = 300000;

setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of store) {
    const valid = timestamps.filter(t => now - t < WINDOW);
    if (valid.length === 0) store.delete(key);
    else store.set(key, valid);
  }
}, CLEANUP_INTERVAL);

export function rateLimit(req, res, next) {
  const key = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  if (!store.has(key)) {
    store.set(key, []);
  }
  const timestamps = store.get(key).filter(t => now - t < WINDOW);
  if (timestamps.length >= MAX) {
    return res.status(429).json({ erro: 'Muitas requisições. Tente novamente em instantes.' });
  }
  timestamps.push(now);
  store.set(key, timestamps);
  next();
}
