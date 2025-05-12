import { pool } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { chauffeur_id } = req.query;
      
        try {
          let query = `
            SELECT c.*, 
                   u.nom AS user_nom, u.prenom AS user_prenom,
                   a.nom AS auto_nom, a.matriculation
            FROM commande c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN automobile a ON c.automobile_id = a.id
          `;
      
          const params = [];
      
          if (chauffeur_id) {
            query += ` WHERE c.chauffeur_id = ? AND c.statut = 'en_attente' `;
            params.push(chauffeur_id);
          }
      
          query += ` ORDER BY c.date_commande DESC`;
      
          const [rows] = await pool.query(query, params);
          return res.status(200).json(rows);
        } catch (error) {
          console.error('Erreur lors de la récupération des commandes :', error);
          return res.status(500).json({ message: 'Erreur serveur' });
        }
      }

  // Méthode non autorisée
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Méthode ${req.method} non autorisée`);
  }
}