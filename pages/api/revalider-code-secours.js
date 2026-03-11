import { prisma } from '@/lib/prisma';
import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';
import { rateLimitVerifier } from '@/lib/rateLimit';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  if (!rateLimitVerifier(req)) {
    return res.status(429).json({ message: 'Trop de tentatives. Réessayez dans quelques minutes.' });
  }

  const code_secours = typeof req.body?.code_secours === 'string' ? req.body.code_secours : '';

  if (!code_secours.trim()) {
    return res.status(400).json({ message: 'Code de secours requis' });
  }

  const codeNormalise = code_secours.trim().toUpperCase();

  try {
    const codeSecours = await prisma.codeSecours.findUnique({
      where: { code: codeNormalise },
      include: { user: true },
    });

    if (!codeSecours) {
      return res.status(400).json({ message: 'Code de secours invalide' });
    }

    if (codeSecours.utilise) {
      return res.status(400).json({ message: 'Ce code de secours a déjà été utilisé' });
    }

    await prisma.codeSecours.update({
      where: { id: codeSecours.id },
      data: { utilise: true },
    });

    const userId = codeSecours.user_id;
    const agenceId = codeSecours.user.agence_id || 0;

    const token = jwt.sign(
      { user_id: userId, agence_id: agenceId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    };

    res.setHeader('Set-Cookie', serialize('code_token', token, cookieOptions));

    return res.status(200).json({
      message: 'Accès revalidé. Vous pouvez consulter le catalogue.',
      redirect: '/produits',
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Revalider code secours:', error?.message);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}
