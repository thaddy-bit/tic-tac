import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
  }

  try {
    const { agence_id } = req.body;

    // Validation de l'ID utilisateur
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "ID utilisateur invalide" });
    }

    // Validation de l'agence si spécifiée
    if (agence_id) {
      const [agence] = await pool.query("SELECT id FROM agences WHERE id = ?", [agence_id]);
      if (agence.length === 0) {
        return res.status(404).json({ message: "Agence non trouvée" });
      }
    }

    const [result] = await pool.query(
      "UPDATE users SET agence_id = ? WHERE id = ?",
      [agence_id || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({ message: "Affectation réussie" });
  } catch (error) {
    console.error("Erreur affectation utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}