import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { ville_id } = req.query;

  if (!ville_id) return res.status(400).json({ message: 'ville_id requis' });

  try {
    const [rows] = await pool.query(
      'SELECT id, nom FROM pharmacies WHERE ville_id = ? ORDER BY nom ASC',
      [ville_id]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erreur récupération pharmacies:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}