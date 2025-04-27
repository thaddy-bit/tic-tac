import { serialize } from 'cookie';  // Décommente ici
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { email, password } = req.body;

  try {
    // Chercher l'utilisateur
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé.' });
    }

    // Comparer le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }

    // Générer le JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Stocke le token dans un cookie HTTP Only
    res.setHeader('Set-Cookie', serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // uniquement en prod
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 jour
      domain: process.env.NODE_ENV === 'production' ? 'tictac-cg.com' : undefined,  // Assure-toi du bon domaine en prod
    }));

    return res.status(200).json({ message: 'Connexion réussie' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}