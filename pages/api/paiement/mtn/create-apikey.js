/**
 * Étape 2 MTN MoMo : générer l'API Key pour l'API User (sandbox ou production).
 * À appeler une fois au setup après create-apiuser. Protégé admin.
 * L'API Key n'est renvoyée qu'une fois par MTN — à enregistrer dans .env (MTN_API_KEY).
 *
 * Env requis :
 * - MTN_COLLECTION_SUBSCRIPTION_KEY
 * - MTN_API_USER_REFERENCE (UUID de l'étape 1)
 * - MTN_MOMO_BASE_URL : optionnel, défaut sandbox
 */
import { requireAdmin } from '@/lib/authApi';

const SANDBOX_BASE = 'https://sandbox.momodeveloper.mtn.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const user = await requireAdmin(req, res);
  if (!user) return;

  const subscriptionKey = process.env.MTN_COLLECTION_SUBSCRIPTION_KEY;
  const apiUserReference = process.env.MTN_API_USER_REFERENCE?.trim();
  const baseUrl = (process.env.MTN_MOMO_BASE_URL || SANDBOX_BASE).replace(/\/$/, '');

  if (!subscriptionKey || !apiUserReference) {
    return res.status(400).json({
      message: 'Config manquante. Définir MTN_COLLECTION_SUBSCRIPTION_KEY et MTN_API_USER_REFERENCE dans .env',
    });
  }

  const apikeyPath = `/v1_0/apiuser/${apiUserReference}/apikey`;

  try {
    const response = await fetch(`${baseUrl}${apikeyPath}`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
      },
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

    const apiKey = body.apiKey ?? body.api_key;
    if (!apiKey) {
      return res.status(500).json({
        message: 'Réponse MTN sans apiKey',
        details: body,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'API Key générée. Ajoute MTN_API_KEY dans .env (MTN ne la renverra plus).',
      apiKey,
      hint: 'Dans .env : MTN_API_KEY=' + apiKey,
    });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') console.error('create-apikey:', err);
    return res.status(500).json({ message: err.message || 'Erreur lors de l\'appel MTN' });
  }
}
