// import pool from '../../lib/db';
import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { code, nom_utilise } = req.body;

  if (!code || !nom_utilise) {
    return res.status(400).json({ message: "Code ou nom manquant" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM code_validation WHERE code = ? AND etat = 'non utilisé'",
      [code]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Code invalide ou déjà utilisé" });
    }

    // Met à jour l'état à 'utilisé' et ajoute le nom_utilise
    await pool.query(
      "UPDATE code_validation SET etat = 'utilisé', nom_utilise = ? WHERE code = ?",
      [nom_utilise, code]
    );

    return res.status(200).json({ message: "Code validé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la vérification du code :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}