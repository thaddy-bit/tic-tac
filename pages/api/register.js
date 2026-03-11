import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { nom, prenom, telephone, email, password, role } = req.body;

  if (!nom || !prenom || !telephone || !email || !password || !role) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Email invalide.' });
  }

  try {
    const existingEmail = await prisma.user.findFirst({
      where: { email },
      select: { id: true },
    });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email déjà utilisé.' });
    }

    const existingPhone = await prisma.user.findFirst({
      where: { telephone },
      select: { id: true },
    });
    if (existingPhone) {
      return res.status(409).json({ message: 'Téléphone déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        nom,
        prenom,
        telephone,
        email,
        password: hashedPassword,
        etat: 'actif',
        role,
      },
    });

    return res.status(201).json({ message: 'Utilisateur créé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}