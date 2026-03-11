import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const user_id = req.body?.user_id;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  if (!user_id) {
    return res.status(400).json({ message: 'User ID manquant' });
  }

  try {
    const commandes = await prisma.commande.findMany({
      where: { user_id: parseInt(user_id, 10) },
      orderBy: { date_commande: 'desc' },
    });

    if (commandes.length === 0) {
      return res.status(404).json({ message: 'Aucune commande trouvée pour cet utilisateur' });
    }

    res.status(200).json(commandes);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
