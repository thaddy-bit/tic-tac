// pages/api/produits/search.js
import { pool } from '@/lib/db';

export default async function handler(req, res) {
  try {
    const { query, ville_id, pharmacie_id } = req.query;

    let sql = `
      SELECT p.*, ph.nom AS pharmacie_nom, v.nom AS ville_nom
      FROM medicaments p
      JOIN pharmacies ph ON p.pharmacie_id = ph.id
      JOIN villes v ON ph.ville_id = v.id
      WHERE 1=1
    `;
    const values = [];

    if (query) {
      sql += " AND p.nom LIKE ?";
      values.push(`${query}%`);
    }

    if (ville_id) {
      sql += " AND ph.ville_id = ?";
      values.push(ville_id);
    }

    if (pharmacie_id) {
      sql += " AND p.pharmacie_id = ?";
      values.push(pharmacie_id);
    }

    const [rows] = await pool.query(sql, values);
    res.status(200).json(rows); // ⬅️ on retourne un tableau
  } catch (error) {
    console.error("Erreur API /produits/search:", error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}