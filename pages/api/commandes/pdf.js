// pages/api/commandes/pdf.ts
import { pool } from '@/lib/db';

export default async function handler(req, res) {
  
  const { date_debut, date_fin, user_id } = req.query;

  if (!date_debut || !date_fin) {
    return res.status(400).json({ message: "Dates manquantes." });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM commandes WHERE user_id = ? AND DATE(date_commande) BETWEEN ? AND ? ORDER BY date_commande DESC",
      [user_id, date_debut, date_fin]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur." });
  }
}