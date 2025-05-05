import { pool } from '@/lib/db';
import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { code, nom_utilise, montant, user_id, agence_id } = req.body;

  if (!code || !nom_utilise || !montant || !user_id || !agence_id) {
    return res.status(400).json({ message: "Champs manquants" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM code_validation WHERE code = ? AND etat = 'non utilisé'",
      [code]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Code invalide ou déjà utilisé" });
    }

    // Marquer le code comme utilisé
    await pool.query(
      "UPDATE code_validation SET etat = 'utilisé', nom_utilise = ? WHERE code = ?",
      [nom_utilise, code]
    );

    const type_transaction = parseInt(montant) <= 200 ? "Consultation" : "Commande";

    await pool.query(
      "INSERT INTO transactions (type_transaction, mode_paiement, montant, date_transaction, user_id, agence_id) VALUES (?, ?, ?, NOW(), ?, ?)",
      [
        type_transaction,
        "Code",
        montant,
        user_id,
        agence_id
      ]
    );

    // Générer le token JWT
    const token = jwt.sign(
      { user_id, code, montant, agence_id },
      process.env.JWT_SECRET,
      { expiresIn: '10m' } // Session de 3 minutes
    );

    // Configurer le cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 10 * 60 // 10 minutes
    };

    res.setHeader('Set-Cookie', serialize('code_token', token, cookieOptions));

    return res.status(200).json({ message: "Code validé et transaction enregistrée avec succès" });

  } catch (error) {
    console.error("Erreur lors de la vérification du code :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}