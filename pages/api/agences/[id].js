import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        const [rows] = await pool.query(`
          SELECT a.*, v.nom AS ville_nom, p.nom AS pays_nom
          FROM agences a
          JOIN villes v ON a.ville_id = v.id
          JOIN pays p ON v.pays_id = p.id
          WHERE a.id = ?
        `, [id]);

        if (rows.length === 0) {
          return res.status(404).json({ message: "Agence non trouvée" });
        }

        res.status(200).json(rows[0]);
      } catch (error) {
        console.error("Erreur récupération agence:", error);
        res.status(500).json({ message: "Erreur serveur" });
      }
      break;

    case 'PUT':
      try {
        const { nom, adresse, ville_id } = req.body;

        if (!nom || !ville_id) {
          return res.status(400).json({ message: "Nom et ville sont requis" });
        }

        const [result] = await pool.query(
          `UPDATE agences 
           SET nom = ?, adresse = ?, ville_id = ?
           WHERE id = ?`,
          [nom, adresse || null, ville_id, id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Agence non trouvée" });
        }

        res.status(200).json({ message: "Agence mise à jour avec succès" });
      } catch (error) {
        console.error("Erreur modification agence:", error);
        
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
          return res.status(400).json({ message: "La ville spécifiée n'existe pas" });
        }

        res.status(500).json({ message: "Erreur serveur" });
      }
      break;

    case 'DELETE':
      try {
        const [result] = await pool.query(
          "DELETE FROM agences WHERE id = ?",
          [id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Agence non trouvée" });
        }

        res.status(200).json({ message: "Agence supprimée avec succès" });
      } catch (error) {
        console.error("Erreur suppression agence:", error);
        
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
          return res.status(400).json({ 
            message: "Impossible de supprimer - cette agence est référencée ailleurs" 
          });
        }

        res.status(500).json({ message: "Erreur serveur" });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
  }
}