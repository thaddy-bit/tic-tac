import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export default async function handler(req, res) {
  try {
    const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
    const token = cookies.code_token;

    if (!token) {
      return res.status(401).json({ message: "Aucun token fourni" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Retourne les infos stockées dans le token (par ex. user_id, code, montant, agence_id)
    return res.status(200).json({ valid: true, data: decoded });

  } catch (error) {
    console.error("Erreur de validation de session code:", error.message);
    return res.status(401).json({ valid: false, message: "Session expirée ou invalide" });
  }
}