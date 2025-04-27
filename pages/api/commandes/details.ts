// pages/api/commandes/details.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { commande_id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  if (!commande_id) {
    return res.status(400).json({ message: "Commande ID manquant" });
  }

  try {
    const [produits] = await pool.query(
      `
      SELECT p.id, p.nom, dc.prix, dc.quantite
      FROM detail_commande dc
      JOIN produits p ON p.id = dc.produit_id
      WHERE dc.commande_id = ?
      `,
      [commande_id]
    );

    res.status(200).json(produits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}