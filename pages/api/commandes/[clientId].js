/*
import { pool } from '@/lib/db';

export default async function handler(req, res) {
  const { clientId } = req.query;

  try {
    const [commandes] = await pool.query(
      'SELECT * FROM commandes WHERE user_id = ? ORDER BY date_commande DESC',
      [clientId]
    );

    for (const commande of commandes) {
      const [details] = await pool.query(
        `SELECT cd.*, p.nom FROM commande_details cd
         JOIN produits p ON cd.produit_id = p.id
         WHERE cd.commande_id = ?`,
        [commande.id]
      );
      commande.details = details;
    }

    res.status(200).json(commandes);
  } catch (error) {
    console.error('Erreur API commandes:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}
*/