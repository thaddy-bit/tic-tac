/**
 * Helpers pour sécuriser les routes API : auth et rôles.
 */
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

/**
 * Récupère l'utilisateur authentifié depuis le cookie token (sans vérifier le rôle).
 * Retourne { user } ou { error, status }.
 */
export async function getAuthUser(req) {
  try {
    const cookies = parse(req.headers.cookie || '');
    let token = cookies.token;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && /^Bearer\s+/i.test(authHeader)) {
        token = authHeader.replace(/^Bearer\s+/i, '').trim();
      }
    }
    if (!token) return { error: 'Non autorisé', status: 401 };

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, nom: true, prenom: true, agence_id: true, role: true },
    });
    if (!user) return { error: 'Utilisateur introuvable', status: 404 };
    return { user };
  } catch {
    return { error: 'Token invalide ou expiré', status: 401 };
  }
}

/**
 * Exige une authentification. Envoie la réponse d'erreur et retourne false si non auth.
 * Sinon retourne l'utilisateur.
 */
export async function requireAuth(req, res) {
  const result = await getAuthUser(req);
  if (result.error) {
    res.status(result.status).json({ message: result.error });
    return null;
  }
  return result.user;
}

const ROLES_ADMIN = ['admin', 'super'];

/**
 * Exige un rôle admin ou super. Utilise requireAuth puis vérifie le rôle.
 */
export async function requireAdmin(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return null;
  if (!ROLES_ADMIN.includes(user.role)) {
    res.status(403).json({ message: 'Accès réservé aux administrateurs' });
    return null;
  }
  return user;
}
