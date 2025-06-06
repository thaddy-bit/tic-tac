import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { commande_id } = req.query;

  if (!commande_id) {
    return res.status(400).json({ message: 'commande_id est requis' });
  }

  try {
    const [rows] = await pool.query(
  `SELECT 
     cd.id, 
     cd.commande_id, 
     cd.produit_id, 
     p.nom AS produit_nom,         -- 🔥 Nom du produit
     p.prixVente AS prix_vente,
     cd.quantite, 
     cd.prix,
     cd.pharmacie_nom
   FROM commande_details cd
   JOIN medicaments p ON cd.produit_id = p.id   -- 🔗 Jointure sur la table produits
   WHERE cd.commande_id = ?`,
  [commande_id]
);


    return res.status(200).json(rows);
  } catch (error) {
    console.error('Erreur chargement commande_details :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}