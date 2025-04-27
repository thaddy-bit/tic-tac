// pages/api/commandes/pdf.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]';
import { pool } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Non autorisé' });
  }

  const { date_debut, date_fin } = req.query;

  if (!date_debut || !date_fin) {
    return res.status(400).json({ message: "Dates manquantes." });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, date_commande, statut, montant_total FROM commandes WHERE client_id = ? AND DATE(date_commande) BETWEEN ? AND ? ORDER BY date_commande DESC",
      [session.user.id, date_debut, date_fin]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur." });
  }
}