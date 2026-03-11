import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { chauffeur_id } = req.query;

    try {
      const where = { statut: 'en_cours' };
      if (chauffeur_id) {
        where.chauffeur_id = parseInt(chauffeur_id, 10);
      }

      const rows = await prisma.commande.findMany({
        where,
        include: {
          user: { select: { nom: true, prenom: true } },
          automobile: { select: { nom: true, matriculation: true } },
        },
        orderBy: { date_commande: 'desc' },
      });

      const formatted = rows.map((c) => ({
        ...c,
        user_nom: c.user?.nom,
        user_prenom: c.user?.prenom,
        auto_nom: c.automobile?.nom,
        matriculation: c.automobile?.matriculation,
      }));

      return res.status(200).json(formatted);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes :', error);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Méthode ${req.method} non autorisée`);
}
