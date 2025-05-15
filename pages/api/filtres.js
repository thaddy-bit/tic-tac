import { pool } from '@/lib/db';

export default async function handler(req, res) {
  try {
    const [villesRows] = await pool.query('SELECT DISTINCT villes FROM pharmacies');
    const [pharmaciesRows] = await pool.query('SELECT id, nom FROM pharmacies');

    const villes = villesRows.map((row) => row.ville);
    const pharmacies = pharmaciesRows.map((row) => ({ id: row.id, nom: row.nom }));

    res.status(200).json({ villes, pharmacies });
  } catch (error) {
    console.error('Erreur API /filtres :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}