import { parse } from "cookie";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  try {
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, nom: true, prenom: true, agence_id: true },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    return res.status(200).json(user);

  } catch {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
}
