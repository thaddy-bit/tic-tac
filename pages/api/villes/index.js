import { pool } from "@/lib/db";

export default async function handler(req, res) {
  switch (req.method) {
    case "GET":
      try {
        const [rows] = await pool.query(`
          SELECT villes.id, villes.nom, pays.nom AS pays_nom, pays.id AS pays_id
          FROM villes
          LEFT JOIN pays ON villes.pays_id = pays.id
          ORDER BY villes.nom ASC
        `);
        res.status(200).json(rows);
      } catch (error) {
        console.error("Erreur liste villes:", error);
        res.status(500).json({ 
          message: "Erreur serveur",
          details: error.message 
        });
      }
      break;

    case "POST":
      const { nom, pays_id } = req.body;

      if (!nom || !pays_id) {
        return res.status(400).json({ 
          message: "Champs requis manquants",
          required: ["nom", "pays_id"] 
        });
      }

      try {
        const [result] = await pool.query(
          "INSERT INTO villes (nom, pays_id) VALUES (?, ?)", 
          [nom, pays_id]
        );
        res.status(201).json({ 
          message: "Ville ajoutée avec succès",
          id: result.insertId 
        });
      } catch (error) {
        console.error("Erreur ajout ville:", error);
        
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
          return res.status(400).json({ 
            message: "Le pays spécifié n'existe pas" 
          });
        }
        
        res.status(500).json({ 
          message: "Erreur serveur",
          details: error.message 
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ 
        message: `Méthode ${req.method} non autorisée` 
      });
  }
}