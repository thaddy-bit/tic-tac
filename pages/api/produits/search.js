import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Le champ de recherche est requis.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM produits WHERE id = ? OR nom LIKE ?',
      [query, `%${query}%`]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Aucun produit trouvé.' });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error('Erreur API /produits/search :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}
