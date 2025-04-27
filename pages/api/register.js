import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { nom, prenom, telephone, email, password, role } = req.body;

  if (!nom || !prenom || !telephone || !email || !password || !role) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  try {
    // 1. Vérifier si l'email existe déjà
    const [existingEmail] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      return res.status(409).json({ message: 'Email déjà utilisé.' });
    }

    // 2. Vérifier si le téléphone existe déjà
    const [existingPhone] = await pool.query('SELECT id FROM users WHERE telephone = ?', [telephone]);
    if (existingPhone.length > 0) {
      return res.status(409).json({ message: 'Téléphone déjà utilisé.' });
    }

    // 3. Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10

    // 4. Insérer l'utilisateur
    await pool.query(
      `INSERT INTO users (nom, prenom, telephone, email, password, etat, role)
       VALUES (?, ?, ?, ?, ?, 'actif', ?)`,
      [nom, prenom, telephone, email, hashedPassword, role]
    );

    return res.status(201).json({ message: 'Utilisateur créé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}