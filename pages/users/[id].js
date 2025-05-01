// /pages/api/users/[id].js
import { pool } from "@/lib/db"; // adapte le chemin selon ta config

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "PUT") {
    const { agence_id } = req.body;

    try {
      const [result] = await pool.query(
        "UPDATE utilisateur SET agence_id = ? WHERE id = ?",
        [agence_id || null, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      return res.status(200).json({ message: "Affectation mise à jour avec succès" });
    } catch (error) {
      console.error("Erreur SQL :", error);
      return res.status(500).json({ message: "Erreur serveur lors de l'affectation" });
    }
  } else {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }
}