import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const [rows] = await pool.query('SELECT id, nom FROM villes ORDER BY nom ASC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erreur récupération villes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}