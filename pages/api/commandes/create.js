import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { panier, nom_patient, livraison } = req.body;

  if (!nom_patient || !panier || panier.length === 0) {
    return res.status(400).json({ message: 'Données invalides.' });
  }

  try {
    const totalProduits = panier.reduce((sum, p) => sum + p.prix * p.quantite, 0);
    const total = totalProduits + livraison;

    const [commandeResult] = await pool.query(
      'INSERT INTO commandes (client_id, total) VALUES (?, ?)',
      [1, total] // Remplacer par le vrai client connecté
    );

    const commandeId = commandeResult.insertId;

    for (const item of panier) {
      await pool.query(
        'INSERT INTO commande_details (commande_id, produit_id, quantite, prix) VALUES (?, ?, ?, ?)',
        [commandeId, item.id, item.quantite, item.prix]
      );
    }

    res.status(200).json({ message: 'Commande enregistrée.' });
  } catch (error) {
    console.error('Erreur commande:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}
