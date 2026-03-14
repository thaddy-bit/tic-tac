/**
 * Étape 1 MTN MoMo : créer l'API User (sandbox ou production).
 * À appeler une fois au setup. Protégé admin.
 *
 * Env requis :
 * - MTN_COLLECTION_SUBSCRIPTION_KEY : clé d'abonnement Collection (clé primaire du portail)
 * - MTN_CALLBACK_HOST : host du callback uniquement (ex. webhook.site ou ton-domaine.com)
 * - MTN_API_USER_REFERENCE : UUID v4 (optionnel ; si absent, un UUID est généré et renvoyé pour le mettre en .env)
 * - MTN_MOMO_BASE_URL : optionnel, défaut sandbox (https://sandbox.momodeveloper.mtn.com)
 */
import { requireAdmin } from '@/lib/authApi';
import crypto from 'crypto';

const SANDBOX_BASE = 'https://sandbox.momodeveloper.mtn.com';
const APIUSER_PATH = '/v1_0/apiuser';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const user = await requireAdmin(req, res);
  if (!user) return;

  const subscriptionKey = process.env.MTN_COLLECTION_SUBSCRIPTION_KEY;
  const callbackHost = process.env.MTN_CALLBACK_HOST;
  const baseUrl = (process.env.MTN_MOMO_BASE_URL || SANDBOX_BASE).replace(/\/$/, '');

  if (!subscriptionKey || !callbackHost) {
    return res.status(400).json({
      message: 'Config manquante. Définir MTN_COLLECTION_SUBSCRIPTION_KEY et MTN_CALLBACK_HOST dans .env',
    });
  }

  let xReferenceId = process.env.MTN_API_USER_REFERENCE?.trim();
  if (!xReferenceId) {
    xReferenceId = crypto.randomUUID();
  }

  try {
    const response = await fetch(`${baseUrl}${APIUSER_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Reference-Id': xReferenceId,
        'Ocp-Apim-Subscription-Key': subscriptionKey,
      },
      body: JSON.stringify({ providerCallbackHost: callbackHost }),
    });

    const text = await response.text();
    let body;
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = { raw: text };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        message: body.message || body.error || 'Erreur MTN',
        details: body,
        status: response.status,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'API User créé avec succès.',
      xReferenceId,
      hint: !process.env.MTN_API_USER_REFERENCE
        ? `Ajoute dans .env : MTN_API_USER_REFERENCE=${xReferenceId}`
        : undefined,
    });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') console.error('create-apiuser:', err);
    return res.status(500).json({ message: err.message || 'Erreur lors de l\'appel MTN' });
  }
}
