/**
 * Helpers MTN MoMo Collection : token et config.
 * Env : MTN_COLLECTION_SUBSCRIPTION_KEY, MTN_API_USER_REFERENCE, MTN_API_KEY, MTN_MOMO_BASE_URL, MTN_TARGET_ENVIRONMENT.
 */
import crypto from 'crypto';

const SANDBOX_BASE = 'https://sandbox.momodeveloper.mtn.com';
const TOKEN_PATH = '/collection/token/';
const REQUEST_TO_PAY_PATH = '/collection/v1_0/requesttopay';

function getBaseUrl() {
  return (process.env.MTN_MOMO_BASE_URL || SANDBOX_BASE).replace(/\/$/, '');
}

function getTargetEnvironment() {
  return process.env.MTN_TARGET_ENVIRONMENT || 'sandbox';
}

/**
 * Obtient un Bearer token pour l'API Collection (étape 3).
 * Basic Auth : username = API User UUID, password = API Key.
 */
export async function getMtnCollectionToken() {
  const baseUrl = getBaseUrl();
  const subscriptionKey = process.env.MTN_COLLECTION_SUBSCRIPTION_KEY;
  const apiUserReference = process.env.MTN_API_USER_REFERENCE?.trim();
  const apiKey = process.env.MTN_API_KEY?.trim();

  if (!subscriptionKey || !apiUserReference || !apiKey) {
    throw new Error('Config MTN manquante (MTN_COLLECTION_SUBSCRIPTION_KEY, MTN_API_USER_REFERENCE, MTN_API_KEY)');
  }

  const basicAuth = Buffer.from(`${apiUserReference}:${apiKey}`).toString('base64');

  const response = await fetch(`${baseUrl}${TOKEN_PATH}`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'X-Target-Environment': getTargetEnvironment(),
    },
  });

  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    throw new Error('Réponse token MTN invalide');
  }

  if (!response.ok) {
    throw new Error(body.message || body.error || `MTN token: ${response.status}`);
  }

  const accessToken = body.access_token;
  if (!accessToken) {
    throw new Error('Réponse MTN sans access_token');
  }

  return accessToken;
}

/**
 * Envoie un Request to Pay à MTN (étape 4).
 * @param {object} params - amount (number), currency (string), externalId (string), payerPartyId (string, MSISDN), payerMessage (string), payeeNote (string), callbackUrl (string)
 * @returns {Promise<{ referenceId: string }>} - X-Reference-Id de la transaction
 */
export async function requestToPay(params) {
  const {
    amount,
    currency,
    externalId,
    payerPartyId,
    payerMessage,
    payeeNote,
    callbackUrl,
  } = params;

  const baseUrl = getBaseUrl();
  const subscriptionKey = process.env.MTN_COLLECTION_SUBSCRIPTION_KEY;
  if (!subscriptionKey || !callbackUrl) {
    throw new Error('Config MTN manquante (subscription key ou callback URL)');
  }

  const token = await getMtnCollectionToken();
  const referenceId = crypto.randomUUID();

  const defaultCurrency = getTargetEnvironment() === 'sandbox' ? 'EUR' : 'XAF';
  const body = {
    amount: String(amount),
    currency: currency || process.env.MTN_CURRENCY || defaultCurrency,
    externalId: (externalId || referenceId).replace(/\s/g, ''),
    payer: {
      partyIdType: 'MSISDN',
      partyId: String(payerPartyId).replace(/\D/g, ''),
    },
    payerMessage: payerMessage || 'Paiement',
    payeeNote: payeeNote || 'Paiement',
  };

  const response = await fetch(`${baseUrl}${REQUEST_TO_PAY_PATH}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'X-Target-Environment': getTargetEnvironment(),
      'X-Reference-Id': referenceId,
      'X-Callback-Url': callbackUrl,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let resBody;
  try {
    resBody = text ? JSON.parse(text) : {};
  } catch {
    resBody = {};
  }

  if (!response.ok) {
    throw new Error(resBody.message || resBody.error || `MTN Request to Pay: ${response.status}`);
  }

  return { referenceId, externalId: body.externalId };
}
