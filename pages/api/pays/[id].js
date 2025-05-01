import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const [rows] = await pool.query("SELECT * FROM pays WHERE id = ?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: "Pays non trouvé" });
      }
      res.status(200).json(rows[0]);
    } catch (err) {
      console.error("Erreur récupération pays:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  else if (req.method === "PUT") {
    const { nom } = req.body;

    if (!nom) {
      return res.status(400).json({ message: "Le nom du pays est requis" });
    }

    try {
      const [result] = await pool.query("UPDATE pays SET nom = ? WHERE id = ?", [nom, id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Pays non trouvé" });
      }
      res.status(200).json({ message: "Pays modifié avec succès" });
    } catch (err) {
      console.error("Erreur modification pays:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  else if (req.method === "DELETE") {
    try {
      const [result] = await pool.query("DELETE FROM pays WHERE id = ?", [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Pays non trouvé" });
      }
      res.status(200).json({ message: "Pays supprimé avec succès" });
    } catch (err) {
      console.error("Erreur suppression pays:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  else {
    res.status(405).json({ message: "Méthode non autorisée" });
  }
}