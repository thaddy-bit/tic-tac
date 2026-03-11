import { prisma } from '@/lib/prisma';
import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { rateLimitVerifier } from '@/lib/rateLimit';

function genererCodeSecours() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  if (!rateLimitVerifier(req)) {
    return res.status(429).json({ message: "Trop de tentatives. Réessayez dans quelques minutes." });
  }

  const body = req.body || {};
  const code = typeof body.code === 'string' ? body.code.trim() : '';
  const nom_utilise = typeof body.nom_utilise === 'string' ? body.nom_utilise.trim() : '';
  const montant = body.montant != null ? parseInt(body.montant, 10) : NaN;
  const user_id = body.user_id != null ? parseInt(body.user_id, 10) : NaN;
  const agence_id = body.agence_id != null ? parseInt(body.agence_id, 10) : NaN;
  const mode_paiement = typeof body.mode_paiement === 'string' ? body.mode_paiement.trim() : '';

  if (!code || !nom_utilise || Number.isNaN(montant) || Number.isNaN(user_id) || Number.isNaN(agence_id)) {
    return res.status(400).json({ message: "Champs manquants" });
  }

  try {
    const codeValidation = await prisma.codeValidation.findFirst({
      where: {
        code,
        etat: 'non_utilise',
      },
    });

    if (!codeValidation) {
      return res.status(400).json({ message: "Code invalide ou déjà utilisé" });
    }

    await prisma.codeValidation.updateMany({
      where: { code },
      data: { etat: 'utilise', nom_utilise },
    });

    const montantNum = parseInt(montant, 10);
    const typeTransaction = montantNum <= 200 ? 'consultation' : 'commande';
    const userId = parseInt(user_id, 10);
    const agenceId = parseInt(agence_id, 10);

    const libelleMode = mode_paiement && typeof mode_paiement === 'string' ? mode_paiement.trim() : 'Code';

    const transaction = await prisma.transaction.create({
      data: {
        type_transaction: typeTransaction,
        mode_paiement: libelleMode,
        montant: montantNum,
        user_id: userId,
        agence_id: agenceId,
      },
    });

    // JWT sans expiration courte : la session est gérée par le cookie (session = tant que l'onglet/navigateur ouvert)
    const token = jwt.sign(
      { user_id: userId, agence_id: agenceId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Cookie de session (pas de maxAge = session cookie : perdu à la fermeture de l'onglet/navigateur)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    };
    // Pas de maxAge => cookie de session

    res.setHeader('Set-Cookie', serialize('code_token', token, cookieOptions));

    // Pour la consultation uniquement : générer un code de secours (une utilisation pour revalider la page sans repayer)
    let code_secours = null;
    if (typeTransaction === 'consultation') {
      let codeSecoursVal = genererCodeSecours();
      let exists = true;
      while (exists) {
        const existing = await prisma.codeSecours.findUnique({ where: { code: codeSecoursVal } });
        if (!existing) exists = false;
        else codeSecoursVal = genererCodeSecours();
      }
      await prisma.codeSecours.create({
        data: {
          code: codeSecoursVal,
          user_id: userId,
          transaction_id: transaction.id,
        },
      });
      code_secours = codeSecoursVal;
    }

    return res.status(200).json({
      message: "Code validé et transaction enregistrée avec succès",
      type_transaction: typeTransaction,
      code_secours: code_secours,
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error("Verifier-code:", error?.message);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
