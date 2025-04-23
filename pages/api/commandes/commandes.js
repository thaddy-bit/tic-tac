import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { client_nom, user_id, chauffeur_id, automobile_id, total, livraison, statut } = req.body;
      
      // Validation des données
      if (!client_nom || !user_id) {
        return res.status(400).json({ message: 'Le nom du client et l\'utilisateur sont obligatoires' });
      }

      const [result] = await pool.query(
        'INSERT INTO commande (client_nom, user_id, chauffeur_id, automobile_id, total, livraison, statut, date_commande) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [client_nom, user_id, chauffeur_id || null, automobile_id || null, total || 0, livraison || 0, statut || 'en_attente']
      );
      
      res.status(201).json({ 
        id: result.insertId,
        message: 'Commande créée avec succès'
      });
    } catch (error) {
      console.error('Error creating commande:', error);
      res.status(500).json({ message: 'Erreur lors de la création de la commande' });
    }
  } else if (req.method === 'GET') {
    try {
      const [rows] = await pool.query(`
        SELECT c.*, 
               u.nom as user_nom, u.prenom as user_prenom,
               ch.nom as chauffeur_nom, ch.prenom as chauffeur_prenom,
               a.nom as auto_nom, a.matriculation
        FROM commande c
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN chauffeur ch ON c.chauffeur_id = ch.id
        LEFT JOIN automobile a ON c.automobile_id = a.id
        ORDER BY c.date_commande DESC
      `);
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching commandes:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des commandes' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}