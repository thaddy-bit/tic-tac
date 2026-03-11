/**
 * Rate limiting en mémoire (par IP).
 * En production multi-instances, préférer Redis.
 */

const store = new Map();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30;     // ex: 30 req/min pour login
const MAX_VERIFIER = 20;     // verifier-code
const MAX_CALLBACK = 100;    // callback MTN

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const first = typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0];
    return first?.trim() || req.socket?.remoteAddress || 'unknown';
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

function cleanup(keyPrefix) {
  const now = Date.now();
  for (const [key, data] of store.entries()) {
    if (key.startsWith(keyPrefix) && now - data.start > WINDOW_MS) store.delete(key);
  }
}

/**
 * Vérifie la limite; retourne true si autorisé, false si dépassé.
 * @param {object} req - requête Next.js
 * @param {string} prefix - ex. 'login', 'verifier', 'callback'
 * @param {number} max - nombre max de requêtes par fenêtre
 */
export function rateLimit(req, prefix, max = MAX_REQUESTS) {
  const ip = getClientIp(req);
  const key = `${prefix}:${ip}`;
  const now = Date.now();

  if (!store.has(key)) {
    store.set(key, { count: 1, start: now });
    return true;
  }

  const data = store.get(key);
  if (now - data.start > WINDOW_MS) {
    data.count = 1;
    data.start = now;
    return true;
  }

  data.count += 1;
  if (data.count > max) {
    cleanup(prefix);
    return false;
  }
  return true;
}

export function rateLimitLogin(req) {
  return rateLimit(req, 'login', MAX_REQUESTS);
}
export function rateLimitVerifier(req) {
  return rateLimit(req, 'verifier', MAX_VERIFIER);
}
export function rateLimitCallback(req) {
  return rateLimit(req, 'callback_mtn', MAX_CALLBACK);
}

export { getClientIp };
