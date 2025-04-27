import jwt from "jsonwebtoken";
import cookie from "cookie";
import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  // Vérifier si req.headers.cookie existe avant de le parser
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  const token = cookies.token || null;

  // Si le token est absent, retourner une erreur 401
  if (!token) {
    return res.status(401).json({ message: "Non autorisé" });
  }

  try {
    // Vérifier et décoder le token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Requête pour récupérer l'utilisateur dans la base de données
    const [rows] = await pool.query("SELECT id, email FROM users WHERE id = ?", [decoded.id]);

    // Si l'utilisateur n'est pas trouvé, retourner une erreur 404
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Retourner les données de l'utilisateur (id et email)
    return res.status(200).json(rows[0]);

  } catch (error) {
    // Gérer les erreurs spécifiques
    console.error("Erreur d'authentification:", error);

    if (error.name === 'JsonWebTokenError') {
      // Token invalide ou mal formé
      return res.status(401).json({ message: "Token invalide" });
    } else if (error.name === 'TokenExpiredError') {
      // Token expiré
      return res.status(401).json({ message: "Token expiré" });
    }

    // Erreur générique serveur
    return res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
  }
}