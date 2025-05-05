import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    
    const { nom, matriculation, etat, type } = req.body;

    try {
      // Validation simple
      if (!nom || !matriculation) {
        return res.status(400).json({ message: 'Nom et matriculation sont requis' });
      }
  
      // Vérification si la matriculation existe déjà
      const [existing] = await pool.query(
        'SELECT id FROM automobile WHERE matriculation = ?',
        [matriculation]
      );
  
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Cette matriculation existe déjà' });
      }
  
      // Insertion
      const [result] = await pool.query(
        'INSERT INTO automobile (nom, matriculation, état, type) VALUES (?, ?, ?, ?)',
        [nom, matriculation, etat, type]
      );
  
      return res.status(201).json({ 
        message: 'Automobile ajoutée avec succès',
        id: result.insertId 
      });
  
    } catch (error) {
      console.error('Erreur API:', error);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  } else if(req.method === 'GET') {

    try {
      const [rows] = await pool.query('SELECT * FROM automobile ORDER BY id DESC');
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching automobiles:', error);
      res.status(500).json({ message: 'Error fetching automobiles' });
    }
  } else {
    return res.status(405).json({ message: 'Méthode non autorisée' });
    }

  


}