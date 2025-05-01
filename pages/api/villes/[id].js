import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const [rows] = await pool.query("SELECT * FROM villes WHERE id = ?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: "ville non trouvé" });
      }
      res.status(200).json(rows[0]);
    } catch (err) {
      console.error("Erreur récupération ville:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  else if (req.method === "PUT") {
    const { id, nom, pays_id } = req.body;

  if (!id || !nom || !pays_id) return res.status(400).json({ message: "Champs requis manquants" });

  try {
    const [result] = await pool.query(
      "UPDATE villes SET nom = ?, pays_id = ? WHERE id = ?",
      [nom, pays_id, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "Ville non trouvée" });

    res.status(200).json({ message: "Ville mise à jour avec succès" });
  } catch (error) {
    console.error("Erreur modification ville:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
  }

  else if (req.method === "DELETE") {

  if (!id) return res.status(400).json({ message: "ID requis" });

  try {
    const [result] = await pool.query("DELETE FROM villes WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Ville non trouvée" });

    res.status(200).json({ message: "Ville supprimée avec succès" });
  } catch (error) {
    console.error("Erreur suppression ville:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
  }

  else {
    res.status(405).json({ message: "Méthode non autorisée" });
  }
}