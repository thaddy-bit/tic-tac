import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const [rows] = await pool.query(`
        SELECT a.id, a.nom, a.adresse, 
               v.nom AS ville_nom, v.id AS ville_id
        FROM agences a
        JOIN villes v ON a.ville_id = v.id
        ORDER BY a.nom ASC
      `);
      res.status(200).json(rows);
    } catch (error) {
      console.error("Erreur liste agences:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else if (req.method === "POST") {
    const { nom, adresse, ville_id } = req.body;

    if (!nom || !ville_id) {
      return res.status(400).json({ message: "Nom et ville sont requis" });
    }

    try {
      const [result] = await pool.query(
        "INSERT INTO agences (nom, adresse, ville_id) VALUES (?, ?, ?)",
        [nom, adresse || null, ville_id]
      );
      res.status(201).json({ 
        message: "Agence créée avec succès",
        id: result.insertId 
      });
    } catch (error) {
      console.error("Erreur création agence:", error);
      
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ message: "La ville spécifiée n'existe pas" });
      }
      
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else {
    res.status(405).json({ message: "Méthode non autorisée" });
  }
}