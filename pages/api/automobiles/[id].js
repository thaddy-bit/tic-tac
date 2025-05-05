// pages/api/automobiles/[id].js
import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    await pool.query('DELETE FROM automobile WHERE id = ?', [id]);
    res.status(200).json({ message: 'Automobile deleted successfully' });
  } catch (error) {
    console.error('Error deleting automobile:', error);
    res.status(500).json({ message: 'Error deleting automobile' });
  }
}