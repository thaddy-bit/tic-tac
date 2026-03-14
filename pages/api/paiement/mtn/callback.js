/**
 * Callback MTN Money : URL à configurer chez MTN (ex. https://votredomaine.com/api/paiement/mtn/callback).
 * - Vérifie la signature si MTN_CALLBACK_SECRET est défini (header X-Signature ou X-Mtn-Signature, format hex ou base64).
 * - Idempotent : même référence traitée une seule fois.
 */
import { prisma } from '@/lib/prisma';
import { rateLimitCallback } from '@/lib/rateLimit';
import crypto from 'crypto';

export const config = { api: { bodyParser: false } };

/** Lit le body brut (compatible Node stream et Vercel / for-await). */
async function getRawBody(req) {
  if (typeof req.body === 'string') return req.body;
  const chunks = [];
  try {
    if (typeof req[Symbol.asyncIterator] === 'function') {
      for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    } else {
      await new Promise((resolve, reject) => {
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', resolve);
        req.on('error', reject);
      });
    }
  } catch {
    return null;
  }
  return Buffer.concat(chunks).toString('utf8');
}

/** Compare la signature (hex ou base64) de manière sécurisée. */
function verifySignature(rawBody, signature, secret) {
  if (!secret || !signature) return false;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBody);
  const expectedHex = hmac.digest('hex');
  const expectedBase64 = hmac.digest('base64');
  const sig = String(signature).trim();
  let a; let b;
  try {
    if (/^[0-9a-fA-F]+$/.test(sig)) {
      a = Buffer.from(sig, 'hex');
      b = Buffer.from(expectedHex, 'hex');
    } else {
      a = Buffer.from(sig, 'base64');
      b = Buffer.from(expectedBase64, 'base64');
    }
  } catch {
    return false;
  }
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  if (!rateLimitCallback(req)) {
    return res.status(429).json({ message: 'Trop de requêtes' });
  }

  let rawBody;
  try {
    rawBody = await getRawBody(req);
  } catch {
    return res.status(400).json({ message: 'Corps invalide' });
  }
  if (rawBody == null) {
    return res.status(400).json({ message: 'Corps invalide' });
  }

  const signature = req.headers['x-signature'] || req.headers['x-mtn-signature'] || req.headers['authorization'];
  const secret = process.env.MTN_CALLBACK_SECRET;

  if (secret) {
    const sig = typeof signature === 'string' ? signature.replace(/^Bearer\s+/i, '').trim() : '';
    if (!verifySignature(rawBody, sig, secret)) {
      if (process.env.NODE_ENV === 'development') console.warn('MTN callback: signature invalide');
      return res.status(401).json({ message: 'Signature invalide' });
    }
  }

  let body;
  try {
    body = JSON.parse(rawBody || '{}');
  } catch {
    return res.status(400).json({ message: 'JSON invalide' });
  }

  const reference = body.reference || body.referenceId || body.externalId || body.financialTransactionId || body.id || '';
  const refStr = String(reference).trim() || `callback-${Date.now()}`;

  try {
    const existing = await prisma.paiementCallbackLog.findUnique({
      where: { reference: refStr },
    });
    if (existing) {
      return res.status(200).json({ received: true });
    }

    await prisma.paiementCallbackLog.create({
      data: {
        reference: refStr,
        status: body.status ?? body.resultCode ?? 'received',
        payload: body,
      },
    });
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(200).json({ received: true });
    }
    if (process.env.NODE_ENV === 'development') console.error('MTN callback:', e?.message);
    return res.status(500).json({ message: 'Erreur serveur' });
  }

  return res.status(200).json({ received: true });
}
