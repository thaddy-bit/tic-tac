import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  try {
    const pharmacies = await prisma.pharmacie.findMany({
      select: { id: true, nom: true, ville_id: true },
    });
    const villeIds = [...new Set(pharmacies.map((p) => p.ville_id).filter(Boolean))];
    const villesList = await prisma.ville.findMany({
      where: { id: { in: villeIds } },
      select: { id: true, nom: true },
    });
    const villes = villesList.map((v) => v.nom);
    res.status(200).json({
      villes,
      pharmacies: pharmacies.map((p) => ({ id: p.id, nom: p.nom })),
    });
  } catch (error) {
    console.error('Erreur API /filtres :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}
