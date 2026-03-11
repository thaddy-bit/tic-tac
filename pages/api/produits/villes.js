import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const rows = await prisma.ville.findMany({
      select: { id: true, nom: true },
      orderBy: { nom: 'asc' },
    });
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erreur récupération villes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
