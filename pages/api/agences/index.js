import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authApi";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const user = await requireAdmin(req, res);
    if (!user) return;
  }

  if (req.method === "GET") {
    try {
      const rows = await prisma.agence.findMany({
        include: { ville: { select: { id: true, nom: true } } },
        orderBy: { nom: 'asc' },
      });
      const formatted = rows.map((a) => ({
        id: a.id,
        nom: a.nom,
        adresse: a.adresse,
        ville_id: a.ville_id,
        ville_nom: a.ville?.nom,
      }));
      res.status(200).json(formatted);
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Liste agences:", error?.message);
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else if (req.method === "POST") {
    const { nom, adresse, ville_id } = req.body;

    if (!nom || !ville_id) {
      return res.status(400).json({ message: "Nom et ville sont requis" });
    }

    try {
      const agence = await prisma.agence.create({
        data: { nom, adresse: adresse || null, ville_id: parseInt(ville_id, 10) },
      });
      res.status(201).json({ message: "Agence créée avec succès", id: agence.id });
    } catch (error) {
      console.error("Erreur création agence:", error);
      if (error.code === 'P2003') {
        return res.status(400).json({ message: "La ville spécifiée n'existe pas" });
      }
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else {
    res.status(405).json({ message: "Méthode non autorisée" });
  }
}
