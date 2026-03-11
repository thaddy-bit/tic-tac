import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { dateDebut, dateFin } = req.query;
  const debut = dateDebut || '2000-01-01';
  const fin = dateFin || '2100-01-01';

  try {
    const commandes = await prisma.commande.findMany({
      where: {
        date_commande: { gte: new Date(debut), lte: new Date(fin) },
      },
      include: { details: true },
      orderBy: { date_commande: 'desc' },
    });

    let total = 0;
    const withDetails = commandes.map((cmd) => {
      total += Number(cmd.total) || 0;
      return { ...cmd, details: cmd.details.map((d) => ({ nom: null, quantite: d.quantite, prix: d.prix })) };
    });

    res.status(200).json({ commandes: withDetails, total });
  } catch (err) {
    console.error('Erreur chargement commandes :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}