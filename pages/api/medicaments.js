// pages/api/medicaments.js

import { pool } from '../../lib/db';

export default async function handler(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM medicaments');
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Aucun médicament trouvé' });
    }

    return res.status(200).json(rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des médicaments:', err);
    return res.status(500).json({ message: 'Erreur interne' });
  }
}