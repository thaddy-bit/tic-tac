import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { code, nom_pharmacie, nom_utilise } = req.body;

    try {
      // Vérifier si le code existe et est non utilisé
      const [rows] = await pool.query(
        'SELECT * FROM code_validation WHERE code = ? AND nom_pharmacie = ? AND etat = "non utilisé"',
        [code, nom_pharmacie]
      );

      if (rows.length > 0) {
        // Si le code est trouvé, le marquer comme utilisé
        const codeValide = rows[0];
        await pool.query(
          'UPDATE code_validation SET etat = "utilisé", nom_utilise = ? WHERE id = ?',
          [nom_utilise, codeValide.id]
        );

        return res.status(200).json({ message: 'Code valide, redirection autorisée !' });
      } else {
        return res.status(400).json({ error: 'Code invalide ou déjà utilisé.' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erreur lors de la validation du code.' });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}
