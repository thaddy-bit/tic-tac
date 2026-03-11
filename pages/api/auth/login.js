import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import { prisma } from "@/lib/prisma";
import { rateLimitLogin } from "@/lib/rateLimit";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  if (!rateLimitLogin(req)) {
    return res.status(429).json({ message: "Trop de tentatives. Réessayez dans quelques minutes." });
  }

  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24
    };

    res.setHeader("Set-Cookie", serialize("token", token, cookieOptions));

    return res.status(200).json({
      message: "Connexion réussie",
      role: user.role,
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Login error:', error?.message);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
