import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  if (req.method === 'PUT') {
    const { agenceId } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { id: idNum },
        select: { id: true },
      });
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      if (agenceId) {
        const agence = await prisma.agence.findUnique({
          where: { id: parseInt(agenceId, 10) },
          select: { id: true },
        });
        if (!agence) {
          return res.status(400).json({ message: "Agence non trouvée" });
        }
      }

      await prisma.user.update({
        where: { id: idNum },
        data: { agence_id: agenceId ? parseInt(agenceId, 10) : null },
      });

      res.status(200).json({ message: "Affectation mise à jour", affectedRows: 1 });
    } catch (error) {
      console.error("Erreur mise à jour agence:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
  }
}
