// pages/api/test-db.js
import { pool } from '@/lib/db'; // adapte le chemin si besoin

export default async function handler(req, res) {
  try {
    const [rows] = await pool.query('SELECT NOW() AS now');
    res.status(200).json({
      success: true,
      message: 'Connexion à la base de données réussie ! ✅',
      serverTime: rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur de connexion à la base de données ❌',
      error: error.message,
    });
  }
}