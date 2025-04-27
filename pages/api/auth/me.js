import jwt from "jsonwebtoken";
import cookie from "cookie";
// import pool from "../../../lib/db"; // Connexion MySQL
import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  // Vérifier si req.headers.cookie existe avant de le parser
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  // console.log("Cookies:", cookies); // Ajout de logs pour le débogage

  // console.log("Cookies reçus en production:", req.headers.cookie);

  const token = cookies?.token || null;
  // console.log("Token récupéré:", token);

  if (!token) {
    return res.status(401).json({ message: "Non autorisé" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // console.log("Token décodé:", decoded);

    const [rows] = await pool.query("SELECT id, email FROM users WHERE id = ?", [decoded.id]);
    // console.log("Résultat de la requête:", rows);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json(rows[0]);

  } catch (error) {
    console.error("Erreur d'authentification:", error);
    res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
  }
}
