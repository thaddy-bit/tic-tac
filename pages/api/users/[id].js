import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: idNum },
        include: {
          agence: { include: { ville: { select: { nom: true } } } },
        },
      });

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const response = {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        agence_id: user.agence_id,
        agence: user.agence_id
          ? {
              id: user.agence.id,
              nom: user.agence.nom,
              ville_nom: user.agence.ville?.nom,
            }
          : null,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Erreur récupération utilisateur:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else if (req.method === 'PUT') {
    try {
      if (req.body.agence_id !== undefined) {
        const { agence_id } = req.body;

        if (agence_id) {
          const agence = await prisma.agence.findUnique({
            where: { id: parseInt(agence_id, 10) },
            select: { id: true },
          });
          if (!agence) {
            return res.status(400).json({ message: "Agence non trouvée" });
          }
        }

        const updated = await prisma.user.update({
          where: { id: idNum },
          data: { agence_id: agence_id ? parseInt(agence_id, 10) : null },
          include: {
            agence: { include: { ville: { select: { nom: true } } } },
          },
        });

        return res.status(200).json({
          message: "Affectation mise à jour",
          user: {
            ...updated,
            password: undefined,
            agence: updated.agence_id
              ? { id: updated.agence.id, nom: updated.agence.nom, ville_nom: updated.agence.ville?.nom }
              : null,
          },
        });
      }

      const { nom, prenom, telephone, email, role } = req.body;

      if (!nom || !prenom || !email) {
        return res.status(400).json({ message: "Champs requis manquants" });
      }

      await prisma.user.update({
        where: { id: idNum },
        data: { nom, prenom, telephone: telephone ?? undefined, email, role: role ?? undefined },
      });

      res.status(200).json({ message: "Utilisateur mis à jour" });
    } catch (error) {
      if (error.code === 'P2025') return res.status(404).json({ message: "Utilisateur non trouvé" });
      if (error.code === 'P2002') return res.status(409).json({ message: "Cet email est déjà utilisé" });
      console.error("Erreur modification utilisateur:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.user.delete({
        where: { id: idNum },
      });
      res.status(200).json({ message: "Utilisateur supprimé" });
    } catch (error) {
      if (error.code === 'P2025') return res.status(404).json({ message: "Utilisateur non trouvé" });
      console.error("Erreur suppression utilisateur:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
  }
}
