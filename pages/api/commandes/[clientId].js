import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const { clientId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  if (!clientId) {
    return res.status(400).json({ message: 'clientId manquant' });
  }

  try {
    const commandes = await prisma.commande.findMany({
      where: { user_id: parseInt(clientId, 10) },
      include: { details: true },
      orderBy: { date_commande: 'desc' },
    });

    const produitIds = [...new Set(commandes.flatMap((c) => c.details.map((d) => d.produit_id).filter(Boolean)))];
    const medicaments = await prisma.medicament.findMany({
      where: { id: { in: produitIds } },
      select: { id: true, Nom: true },
    });
    const medMap = Object.fromEntries(medicaments.map((m) => [m.id, m.Nom]));

    const withDetails = commandes.map((cmd) => ({
      ...cmd,
      details: cmd.details.map((d) => ({
        ...d,
        nom: d.produit_id ? medMap[d.produit_id] ?? null : null,
      })),
    }));

    res.status(200).json(withDetails);
  } catch (error) {
    console.error('Erreur API commandes:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}
