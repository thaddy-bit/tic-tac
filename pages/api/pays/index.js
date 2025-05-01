import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const [rows] = await pool.query("SELECT * FROM pays ORDER BY id DESC");
      res.status(200).json(rows);
    } catch (err) {
      console.error("Erreur récupération pays:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  else if (req.method === "POST") {
    const { nom } = req.body;

    if (!nom) {
      return res.status(400).json({ message: "Le nom du pays est requis" });
    }

    try {
      await pool.query("INSERT INTO pays (nom) VALUES (?)", [nom]);
      res.status(201).json({ message: "Pays ajouté avec succès" });
    } catch (err) {
      console.error("Erreur ajout pays:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  else {
    res.status(405).json({ message: "Méthode non autorisée" });
  }
}