import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authApi";

export default async function handler(req, res) {
  const { id } = req.query;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  if (req.method === 'PUT' || req.method === 'DELETE') {
    const user = await requireAdmin(req, res);
    if (!user) return;
  }

  if (req.method === 'GET') {
    try {
      const agence = await prisma.agence.findUnique({
        where: { id: idNum },
        include: {
          ville: { include: { pays: { select: { nom: true } } } },
        },
      });
      if (!agence) {
        return res.status(404).json({ message: "Agence non trouvée" });
      }
      res.status(200).json({
        ...agence,
        ville_nom: agence.ville?.nom,
        pays_nom: agence.ville?.pays?.nom,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Récupération agence:", error?.message);
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else if (req.method === 'PUT') {
    const { nom, adresse, ville_id } = req.body;

    if (!nom || !ville_id) {
      return res.status(400).json({ message: "Nom et ville sont requis" });
    }

    try {
      await prisma.agence.update({
        where: { id: idNum },
        data: { nom, adresse: adresse || null, ville_id: parseInt(ville_id, 10) },
      });
      res.status(200).json({ message: "Agence mise à jour avec succès" });
    } catch (error) {
      if (error.code === 'P2025') return res.status(404).json({ message: "Agence non trouvée" });
      if (error.code === 'P2003') return res.status(400).json({ message: "La ville spécifiée n'existe pas" });
      if (process.env.NODE_ENV === "development") console.error("Modification agence:", error?.message);
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.agence.delete({
        where: { id: idNum },
      });
      res.status(200).json({ message: "Agence supprimée avec succès" });
    } catch (error) {
      if (error.code === 'P2025') return res.status(404).json({ message: "Agence non trouvée" });
      if (error.code === 'P2003') return res.status(400).json({ message: "Impossible de supprimer - cette agence est référencée ailleurs" });
      if (process.env.NODE_ENV === "development") console.error("Suppression agence:", error?.message);
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
  }
}
