import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE etat = ? AND role = ?', ['actif','livreur']);
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching chauffeurs:', error);
      res.status(500).json({ message: 'Error fetching chauffeurs' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}