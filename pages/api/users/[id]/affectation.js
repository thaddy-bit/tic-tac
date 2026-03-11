import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
  }

  const idNum = parseInt(id, 10);
  if (!id || isNaN(idNum)) {
    return res.status(400).json({ message: "ID utilisateur invalide" });
  }

  try {
    const { agence_id } = req.body;

    if (agence_id) {
      const agence = await prisma.agence.findUnique({
        where: { id: parseInt(agence_id, 10) },
        select: { id: true },
      });
      if (!agence) {
        return res.status(404).json({ message: "Agence non trouvée" });
      }
    }

    const user = await prisma.user.update({
      where: { id: idNum },
      data: { agence_id: agence_id ? parseInt(agence_id, 10) : null },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({ message: "Affectation réussie" });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: "Utilisateur non trouvé" });
    console.error("Erreur affectation utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}
