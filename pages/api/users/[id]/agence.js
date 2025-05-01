import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { agenceId } = req.body;

    try {
      // Vérifier que l'utilisateur existe
      const [userCheck] = await pool.query(
        'SELECT id FROM users WHERE id = ?',
        [id]
      );

      if (userCheck.length === 0) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      // Vérifier que l'agence existe si elle est spécifiée
      if (agenceId) {
        const [agenceCheck] = await pool.query(
          'SELECT id FROM agences WHERE id = ?',
          [agenceId]
        );

        if (agenceCheck.length === 0) {
          return res.status(400).json({ message: "Agence non trouvée" });
        }
      }

      // Mettre à jour l'affectation
      const [result] = await pool.query(
        'UPDATE users SET agence_id = ? WHERE id = ?',
        [agenceId || null, id]
      );

      res.status(200).json({ 
        message: "Affectation mise à jour",
        affectedRows: result.affectedRows
      });
    } catch (error) {
      console.error("Erreur mise à jour agence:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
  }
}