import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { nom, matriculation, etat, type } = req.body;

    if (!nom || !matriculation) {
      return res.status(400).json({ message: 'Nom et matriculation sont requis' });
    }

    try {
      const existing = await prisma.automobile.findFirst({
        where: { matriculation },
        select: { id: true },
      });
      if (existing) {
        return res.status(400).json({ message: 'Cette matriculation existe déjà' });
      }

      const auto = await prisma.automobile.create({
        data: {
          nom,
          matriculation,
          type: type || 'moto',
          etat: etat || 'disponible',
        },
      });
      return res.status(201).json({ message: 'Automobile ajoutée avec succès', id: auto.id });
    } catch (error) {
      console.error('Erreur API:', error);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  if (req.method === 'GET') {
    try {
      const rows = await prisma.automobile.findMany({
        orderBy: { id: 'desc' },
      });
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching automobiles:', error);
      res.status(500).json({ message: 'Error fetching automobiles' });
    }
  } else {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }
}
