import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { date_debut, date_fin, agence_id } = req.query;

  const where = {};
  if (date_debut && date_fin) {
    where.date_transaction = {
      gte: new Date(date_debut),
      lte: new Date(date_fin),
    };
  }
  if (agence_id) {
    where.agence_id = parseInt(agence_id, 10);
  }

  try {
    const rows = await prisma.transaction.findMany({
      where,
      orderBy: { date_transaction: 'desc' },
    });

    const commandes = rows.filter((tx) => tx.type_transaction === 'commande');
    const consultations = rows.filter((tx) => tx.type_transaction === 'consultation');
    const totalCommande = commandes.reduce((sum, tx) => sum + tx.montant, 0);
    const totalConsultation = consultations.reduce((sum, tx) => sum + tx.montant, 0);

    res.status(200).json({
      commandes,
      consultations,
      totalCommande,
      totalConsultation,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}
