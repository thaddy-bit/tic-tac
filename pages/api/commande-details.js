import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { commande_id } = req.query;

  if (!commande_id) {
    return res.status(400).json({ message: 'Commande ID is required' });
  }

  try {
    const [results] = await pool.query(
      `SELECT dc.*, p.Nom as produit_nom 
       FROM commande_details dc
       JOIN produits p ON dc.produit_id = p.id
       WHERE dc.commande_id = ?`,
      [commande_id]
    );

    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching command details:', error);
    res.status(500).json({ message: 'Error fetching command details' });
  }
}