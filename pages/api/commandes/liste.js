import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { dateDebut, dateFin } = req.query;

  try {
    const [commandes] = await pool.query(
      `SELECT * FROM commandes 
       WHERE date_commande BETWEEN ? AND ?
       ORDER BY date_commande DESC`,
      [dateDebut || '2000-01-01', dateFin || '2100-01-01']
    );

    let total = 0;

    // Ajouter les détails de chaque commande
    for (const cmd of commandes) {
      total += parseFloat(cmd.total);

      const [details] = await pool.query(
        `SELECT p.nom, cd.quantite, cd.prix 
         FROM commande_details cd 
         JOIN produits p ON p.id = cd.produit_id
         WHERE cd.commande_id = ?`,
        [cmd.id]
      );

      cmd.details = details;
    }

    res.status(200).json({ commandes, total });
  } catch (err) {
    console.error('Erreur chargement commandes :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}