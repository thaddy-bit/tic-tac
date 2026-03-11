import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const { date_debut, date_fin, user_id } = req.query;

  if (!date_debut || !date_fin) {
    return res.status(400).json({ message: 'Dates manquantes.' });
  }

  try {
    const where = {
      date_commande: {
        gte: new Date(String(date_debut)),
        lte: new Date(String(date_fin)),
      },
    };
    if (user_id) {
      where.user_id = parseInt(String(user_id), 10);
    }

    const rows = await prisma.commande.findMany({
      where,
      orderBy: { date_commande: 'desc' },
    });

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}
