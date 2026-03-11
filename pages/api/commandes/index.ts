import type { NextApiRequest, NextApiResponse } from 'next';
import type { Commande } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { client_id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  if (!client_id) {
    return res.status(400).json({ message: 'Client ID manquant' });
  }

  try {
    const commandes = await prisma.commande.findMany({
      where: { user_id: parseInt(String(client_id), 10) },
      select: { id: true, date_commande: true, statut: true, total: true },
      orderBy: { date_commande: 'desc' },
    });
    type CommandeRow = Pick<Commande, 'id' | 'date_commande' | 'statut' | 'total'>;
    const formatted = commandes.map((c: CommandeRow) => ({
      id: c.id,
      date_commande: c.date_commande,
      statut: c.statut,
      montant_total: c.total,
    }));
    res.status(200).json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
