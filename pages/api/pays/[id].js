import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  if (req.method === "GET") {
    try {
      const pays = await prisma.pays.findUnique({
        where: { id: idNum },
      });
      if (!pays) {
        return res.status(404).json({ message: "Pays non trouvé" });
      }
      res.status(200).json(pays);
    } catch (err) {
      console.error("Erreur récupération pays:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else if (req.method === "PUT") {
    const { nom } = req.body;

    if (!nom) {
      return res.status(400).json({ message: "Le nom du pays est requis" });
    }

    try {
      await prisma.pays.update({
        where: { id: idNum },
        data: { nom },
      });
      res.status(200).json({ message: "Pays modifié avec succès" });
    } catch (err) {
      if (err.code === 'P2025') {
        return res.status(404).json({ message: "Pays non trouvé" });
      }
      console.error("Erreur modification pays:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else if (req.method === "DELETE") {
    try {
      await prisma.pays.delete({
        where: { id: idNum },
      });
      res.status(200).json({ message: "Pays supprimé avec succès" });
    } catch (err) {
      if (err.code === 'P2025') {
        return res.status(404).json({ message: "Pays non trouvé" });
      }
      console.error("Erreur suppression pays:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else {
    res.status(405).json({ message: "Méthode non autorisée" });
  }
}
