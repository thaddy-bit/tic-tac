// pages/api/commandes/details.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import type { CommandeDetail, Medicament } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { commande_id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  if (!commande_id) {
    return res.status(400).json({ message: 'Commande ID manquant' });
  }

  try {
    const details = await prisma.commandeDetail.findMany({
      where: { commande_id: parseInt(String(commande_id), 10) },
    });
    const produitIds = details.map((d: CommandeDetail) => d.produit_id).filter((id: number | null): id is number => id != null);
    const medicaments = await prisma.medicament.findMany({
      where: { id: { in: produitIds } },
      select: { id: true, Nom: true, prixVente: true },
    });
    type MedRow = Pick<Medicament, 'id' | 'Nom' | 'prixVente'>;
    const medMap = Object.fromEntries(medicaments.map((m: MedRow) => [m.id, m]));
    const produits = details.map((d: CommandeDetail) => ({
      id: d.produit_id,
      nom: d.produit_id ? medMap[d.produit_id]?.Nom ?? null : null,
      prix: d.prix,
      quantite: d.quantite,
    }));
    res.status(200).json(produits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}