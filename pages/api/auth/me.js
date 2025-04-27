import jwt from "jsonwebtoken";
import cookie from "cookie";
import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  // Ajout d'un log pour vérifier la valeur de cookies
  console.log("Headers:", req.headers);

  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};

  // Vérifie si le cookie 'token' existe
  const token = cookies?.token || null;

  if (!token) {
    return res.status(401).json({ message: "Non autorisé" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await pool.query("SELECT id, email FROM users WHERE id = ?", [decoded.id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json(rows[0]);

  } catch (error) {
    console.error("Erreur d'authentification:", error);
    res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
  }
}