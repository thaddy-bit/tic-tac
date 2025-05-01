import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        const [rows] = await pool.query(`
          SELECT u.id, u.nom, u.prenom, u.email, u.telephone, u.role, 
                 u.agence_id, a.nom as agence_nom, a.ville_nom as agence_ville
          FROM users u
          LEFT JOIN agences a ON u.agence_id = a.id
          WHERE u.id = ?
        `, [id]);

        if (rows.length === 0) {
          return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        const user = rows[0];
        const response = {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          telephone: user.telephone,
          role: user.role,
          agence_id: user.agence_id,
          agence: user.agence_id ? {
            id: user.agence_id,
            nom: user.agence_nom,
            ville_nom: user.agence_ville
          } : null
        };

        res.status(200).json(response);
      } catch (error) {
        console.error("Erreur récupération utilisateur:", error);
        res.status(500).json({ message: "Erreur serveur" });
      }
      break;

    case 'PUT':
      try {
        // Vérifie si c'est une mise à jour d'affectation
        if (req.body.agence_id !== undefined) {
          const { agence_id } = req.body;
          
          // Valider que l'agence existe si elle est spécifiée
          if (agence_id) {
            const [agenceRows] = await pool.query(
              "SELECT id FROM agences WHERE id = ?",
              [agence_id]
            );
            
            if (agenceRows.length === 0) {
              return res.status(400).json({ message: "Agence non trouvée" });
            }
          }

          const [result] = await pool.query(
            `UPDATE users SET agence_id = ? WHERE id = ?`,
            [agence_id || null, id]
          );

          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
          }

          // Retourner les données mises à jour
          // Modifiez la requête SQL pour utiliser le bon nom de colonne
          const [updatedRows] = await pool.query(`
            SELECT u.id, u.nom, u.prenom, u.email, u.telephone, u.role, 
                   u.agence_id, a.nom AS agence_nom, v.nom AS agence_ville
            FROM users u
            LEFT JOIN agences a ON u.agence_id = a.id
            LEFT JOIN villes v ON a.ville_id = v.id
            WHERE u.id = ?
          `, [id]);          

          return res.status(200).json({
            message: "Affectation mise à jour",
            user: {
              ...updatedRows[0],
              agence: updatedRows[0].agence_id ? {
                id: updatedRows[0].agence_id,
                nom: updatedRows[0].agence_nom,
                ville_nom: updatedRows[0].agence_ville
              } : null
            }
          });
        }

        // Mise à jour standard des informations utilisateur
        const { nom, prenom, telephone, email, role } = req.body;

        if (!nom || !prenom || !email) {
          return res.status(400).json({ message: "Champs requis manquants" });
        }

        const [result] = await pool.query(
          `UPDATE users 
           SET nom = ?, prenom = ?, telephone = ?, email = ?, role = ?
           WHERE id = ?`,
          [nom, prenom, telephone, email, role, id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.status(200).json({ message: "Utilisateur mis à jour" });
      } catch (error) {
        console.error("Erreur modification utilisateur:", error);
        
        if (error.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ message: "Cet email est déjà utilisé" });
        }

        res.status(500).json({ message: "Erreur serveur" });
      }
      break;

    case 'DELETE':
      try {
        // Empêche la suppression de l'utilisateur actuel
        if (req.user?.id === id) {
          return res.status(403).json({ message: "Vous ne pouvez pas supprimer votre propre compte" });
        }

        const [result] = await pool.query(
          "DELETE FROM users WHERE id = ?",
          [id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.status(200).json({ message: "Utilisateur supprimé" });
      } catch (error) {
        console.error("Erreur suppression utilisateur:", error);
        res.status(500).json({ message: "Erreur serveur" });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
  }
}