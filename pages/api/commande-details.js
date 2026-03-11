import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { commande_id } = req.query;

  if (!commande_id) {
    return res.status(400).json({ message: 'commande_id est requis' });
  }

  try {
    const details = await prisma.commandeDetail.findMany({
      where: { commande_id: parseInt(commande_id, 10) },
    });

    const produitIds = details.map((d) => d.produit_id).filter((id) => id != null);
    const medicaments = await prisma.medicament.findMany({
      where: { id: { in: produitIds } },
      select: { id: true, Nom: true, prixVente: true },
    });
    const medMap = Object.fromEntries(medicaments.map((m) => [m.id, m]));

    const rows = details.map((cd) => ({
      id: cd.id,
      commande_id: cd.commande_id,
      produit_id: cd.produit_id,
      produit_nom: cd.produit_id ? medMap[cd.produit_id]?.Nom ?? null : null,
      prix_vente: cd.produit_id ? medMap[cd.produit_id]?.prixVente ?? null : null,
      quantite: cd.quantite,
      prix: cd.prix,
      pharmacie_nom: cd.pharmacie_nom,
    }));

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Erreur chargement commande_details :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}
