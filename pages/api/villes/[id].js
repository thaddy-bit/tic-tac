import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  if (req.method === "GET") {
    try {
      const ville = await prisma.ville.findUnique({
        where: { id: idNum },
      });
      if (!ville) {
        return res.status(404).json({ message: "ville non trouvé" });
      }
      res.status(200).json(ville);
    } catch (err) {
      console.error("Erreur récupération ville:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else if (req.method === "PUT") {
    const { id: bodyId, nom, pays_id } = req.body;

    if (!bodyId || !nom || !pays_id) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    try {
      await prisma.ville.update({
        where: { id: idNum },
        data: { nom, pays_id: parseInt(pays_id, 10) },
      });
      res.status(200).json({ message: "Ville mise à jour avec succès" });
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ message: "Ville non trouvée" });
      console.error("Erreur modification ville:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else if (req.method === "DELETE") {
    try {
      await prisma.ville.delete({
        where: { id: idNum },
      });
      res.status(200).json({ message: "Ville supprimée avec succès" });
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ message: "Ville non trouvée" });
      console.error("Erreur suppression ville:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else {
    res.status(405).json({ message: "Méthode non autorisée" });
  }
}
