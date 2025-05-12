import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { method } = req;

  if (method === "GET") {
    const { chauffeur_id } = req.query;

    if (!chauffeur_id) {
      return res.status(400).json({ message: "chauffeur_id requis" });
    }

    try {
      const [rows] = await pool.query(`
        SELECT c.*, u.nom as client_nom, u.prenom as client_prenom
        FROM commandes c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.chauffeur_id = ? AND c.statut = 'en cours'
        ORDER BY c.date_commande DESC
      `, [chauffeur_id]);

      return res.status(200).json(rows);
    } catch (error) {
      console.error("Erreur GET commandes livreur :", error);
      return res.status(500).json({ message: "Erreur serveur" });
    }

  } else if (method === "POST") {
    const { commande_id } = req.body;

    if (!commande_id) {
      return res.status(400).json({ message: "commande_id requis" });
    }

    try {
      await pool.query(`
        UPDATE commandes SET statut = 'livre'
        WHERE id = ?
      `, [commande_id]);

      return res.status(200).json({ message: "Commande validée" });
    } catch (error) {
      console.error("Erreur PUT validation commande :", error);
      return res.status(500).json({ message: "Erreur serveur" });
    }

  } else {
    res.setHeader("Allow", ["GET", "PUT"]);
    return res.status(405).end(`Méthode ${method} non autorisée`);
  }
}