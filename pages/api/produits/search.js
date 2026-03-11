// pages/api/produits/search.js
import { prisma } from '@/lib/prisma';

const LIMIT = 20;

export default async function handler(req, res) {
  try {
    const { query, ville_id, pharmacie_id, page: pageParam, limit: limitParam } = req.query;

    const where = {};
    if (query) {
      where.Nom = { startsWith: query };
    }
    if (pharmacie_id) {
      where.pharmacie_id = parseInt(pharmacie_id, 10);
    }
    if (ville_id) {
      const pharmacies = await prisma.pharmacie.findMany({
        where: { ville_id: parseInt(ville_id, 10) },
        select: { id: true },
      });
      where.pharmacie_id = { in: pharmacies.map((p) => p.id) };
    }

    const page = Math.max(1, parseInt(pageParam, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(limitParam, 10) || LIMIT));
    const skip = (page - 1) * limit;

    const [total, rows] = await Promise.all([
      prisma.medicament.count({ where }),
      prisma.medicament.findMany({ where, skip, take: limit }),
    ]);

    const pharmacyIds = [...new Set(rows.map((m) => m.pharmacie_id).filter(Boolean))];
    const pharmacies = await prisma.pharmacie.findMany({
      where: { id: { in: pharmacyIds } },
      include: { ville: { select: { nom: true } } },
    });
    const villeByPharma = Object.fromEntries(
      pharmacies.map((p) => [p.id, p.ville?.nom ?? null])
    );

    const items = rows.map((p) => ({
      ...p,
      pharmacie_nom: p.pharmacie_nom,
      ville_nom: villeByPharma[p.pharmacie_id] ?? null,
    }));

    const totalPages = Math.ceil(total / limit);
    res.status(200).json({
      items,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("Erreur API /produits/search:", error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
