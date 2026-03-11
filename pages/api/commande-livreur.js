import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    const { chauffeur_id } = req.query;
    if (!chauffeur_id) return res.status(400).json({ message: 'chauffeur_id requis' });
    try {
      const rows = await prisma.commande.findMany({
        where: { chauffeur_id: parseInt(chauffeur_id, 10), statut: 'en_cours' },
        include: { user: { select: { nom: true, prenom: true } } },
        orderBy: { date_commande: 'desc' },
      });
      const formatted = rows.map((c) => ({ ...c, client_nom: c.user?.nom, client_prenom: c.user?.prenom }));
      return res.status(200).json(formatted);
    } catch (error) {
      console.error('Erreur GET commandes livreur :', error);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  if (method === 'POST') {
    const { commande_id } = req.body;
    if (!commande_id) return res.status(400).json({ message: 'commande_id requis' });
    try {
      await prisma.commande.update({
        where: { id: parseInt(commande_id, 10) },
        data: { statut: 'livre' },
      });
      return res.status(200).json({ message: 'Commande validée' });
    } catch (error) {
      console.error('Erreur PUT validation commande :', error);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Méthode ${method} non autorisée`);
}