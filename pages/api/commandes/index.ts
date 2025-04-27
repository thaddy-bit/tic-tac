// pages/api/commandes/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db'; // adapte selon ton fichier de connexion à MySQL

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { client_id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  if (!client_id) {
    return res.status(400).json({ message: "Client ID manquant" });
  }

  try {
    const [commandes] = await pool.query(
      "SELECT id, date_commande, statut, montant_total FROM commandes WHERE client_id = ? ORDER BY date_commande DESC",
      [client_id]
    );

    res.status(200).json(commandes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}