import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { date_debut, date_fin, agence_id } = req.query;

  let conditions = [];
  let params = [];

  if (date_debut && date_fin) {
    conditions.push("date_transaction BETWEEN ? AND ?");
    params.push(date_debut, date_fin);
  }

  if (agence_id) {
    conditions.push("agence_id = ?");
    params.push(agence_id);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : "";

  try {
    const [rows] = await pool.query(
      `SELECT *
       FROM transactions
       ${whereClause}
       ORDER BY date_transaction DESC`,
      params
    );

    // Séparer les transactions
    const commandes = rows.filter(tx => tx.type_transaction === 'commande');
    const consultations = rows.filter(tx => tx.type_transaction === 'consultation');

    // Montants totaux
    const totalCommande = commandes.reduce((sum, tx) => sum + tx.montant, 0);
    const totalConsultation = consultations.reduce((sum, tx) => sum + tx.montant, 0);

    res.status(200).json({
      commandes,
      consultations,
      totalCommande,
      totalConsultation
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}