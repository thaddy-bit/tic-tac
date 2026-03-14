/**
 * Étape 4 MTN MoMo : Request to Pay (déclencher un paiement Collection).
 * Appelé par la page paiement quand le client valide en mode MTN Money.
 * Env : MTN_CALLBACK_URL (URL complète du callback, ex. https://ton-app.vercel.app/api/paiement/mtn/callback)
 */
import { getAuthUser } from '@/lib/authApi';
import { requestToPay } from '@/lib/mtnCollection';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const auth = await getAuthUser(req);
  if (auth.error) {
    return res.status(auth.status || 401).json({ message: auth.error });
  }

  const callbackUrl = process.env.MTN_CALLBACK_URL;
  if (!callbackUrl) {
    return res.status(500).json({
      message: 'MTN_CALLBACK_URL non configurée (ex. https://ton-domaine.com/api/paiement/mtn/callback)',
    });
  }

  let body;
  try {
    body = typeof req.body === 'object' && req.body !== null ? req.body : JSON.parse(req.body || '{}');
  } catch {
    return res.status(400).json({ message: 'Body JSON invalide' });
  }

  const amount = body.montant != null ? Number(body.montant) : NaN;
  const numeroDebiter = typeof body.numeroDebiter === 'string' ? body.numeroDebiter.trim() : '';
  const typeTransaction = body.typeTransaction === 'Livraison' ? 'Livraison' : 'Consultation';

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: 'Montant invalide' });
  }
  if (!numeroDebiter) {
    return res.status(400).json({ message: 'Numéro à débiter requis' });
  }

  const externalId = body.externalId || `tic-tac-${Date.now()}-${auth.user.id}`;
  const payerMessage = body.payerMessage || `Paiement ${typeTransaction} - Tic-Tac`;
  const payeeNote = body.payeeNote || typeTransaction;

  try {
    const { referenceId } = await requestToPay({
      amount,
      currency: process.env.MTN_CURRENCY,
      externalId,
      payerPartyId: numeroDebiter,
      payerMessage,
      payeeNote,
      callbackUrl,
    });

    return res.status(200).json({
      success: true,
      message: 'Demande de paiement envoyée. Le client doit confirmer sur son téléphone.',
      referenceId,
    });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') console.error('request-to-pay:', err);
    return res.status(500).json({
      message: err.message || 'Erreur lors de la demande de paiement MTN',
    });
  }
}
