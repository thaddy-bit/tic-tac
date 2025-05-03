import { parse } from "cookie";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  try {
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await pool.query("SELECT id, email, nom, prenom, agence_id FROM users WHERE id = ?", [decoded.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    return res.status(200).json(rows[0]);

  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
}