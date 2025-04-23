import pool from '../../lib/db';

export default async function handler(req, res) {
  try {
    const [rows] = await pool.query("SELECT 'Connexion réussie' AS message");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}