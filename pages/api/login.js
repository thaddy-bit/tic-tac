import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.setHeader('Set-Cookie', serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
      domain: process.env.NODE_ENV === 'production' ? 'tictac-cg.com' : undefined,
    }));

    return res.status(200).json({ message: 'Connexion réussie' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}
