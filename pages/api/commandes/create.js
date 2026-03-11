import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { panier, nom_patient, livraison } = req.body;

  if (!nom_patient || !panier || panier.length === 0) {
    return res.status(400).json({ message: 'Données invalides.' });
  }

  try {
    const totalProduits = panier.reduce((sum, p) => sum + p.prix * p.quantite, 0);
    const total = totalProduits + (livraison || 0);

    const commande = await prisma.commande.create({
      data: {
        client_nom: nom_patient,
        telephone: '',
        user_id: 1,
        chauffeur_id: 1,
        automobile_id: 1,
        total,
        livraison: livraison || 0,
        statut: 'en_cours',
        adresse: '',
      },
    });

    for (const item of panier) {
      await prisma.commandeDetail.create({
        data: {
          commande_id: commande.id,
          produit_id: item.id,
          quantite: item.quantite,
          prix: item.prix,
        },
      });
    }

    res.status(200).json({ message: 'Commande enregistrée.' });
  } catch (error) {
    console.error('Erreur commande:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}
