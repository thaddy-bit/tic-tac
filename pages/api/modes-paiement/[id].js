import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authApi";

export default async function handler(req, res) {
  const { id } = req.query;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  if (req.method === "PUT" || req.method === "DELETE") {
    const user = await requireAdmin(req, res);
    if (!user) return;
  }

  if (req.method === "GET") {
    try {
      const mode = await prisma.modePaiement.findUnique({
        where: { id: idNum },
      });
      if (!mode) {
        return res.status(404).json({ message: "Mode de paiement non trouvé" });
      }
      res.status(200).json({
        id: mode.id,
        nom: mode.nom,
        code: mode.code,
        type: mode.type,
        actif: mode.actif,
        ordre: mode.ordre,
        description: mode.description,
        instructions: mode.instructions,
        logo_url: mode.logo_url,
        config_public: mode.config_public,
        created_at: mode.created_at,
        updated_at: mode.updated_at,
      });
    } catch (error) {
      console.error("Erreur récupération mode paiement:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else if (req.method === "PUT") {
    const { nom, code, type, actif, ordre, description, instructions, logo_url, config_public } = req.body;

    if (!nom || !code || typeof code !== "string") {
      return res.status(400).json({ message: "Nom et code sont requis" });
    }

    const codeNorm = code.trim().toLowerCase().replace(/\s+/g, "_");
    if (!codeNorm) {
      return res.status(400).json({ message: "Code invalide" });
    }

    try {
      await prisma.modePaiement.update({
        where: { id: idNum },
        data: {
          nom: nom.trim(),
          code: codeNorm,
          type: type === "code" || type === "mobile_money" || type === "autre" ? type : "autre",
          actif: actif !== false,
          ordre: typeof ordre === "number" ? ordre : parseInt(ordre, 10) || 0,
          description: description ? String(description).trim() : null,
          instructions: instructions ? String(instructions).trim() : null,
          logo_url: logo_url ? String(logo_url).trim() : null,
          config_public: config_public != null ? (typeof config_public === "string" ? JSON.parse(config_public) : config_public) : null,
        },
      });
      res.status(200).json({ message: "Mode de paiement mis à jour avec succès" });
    } catch (error) {
      if (error.code === "P2025") return res.status(404).json({ message: "Mode de paiement non trouvé" });
      if (error.code === "P2002") return res.status(400).json({ message: "Un autre mode utilise déjà ce code" });
      if (process.env.NODE_ENV === "development") console.error("Modification mode paiement:", error?.message);
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else if (req.method === "DELETE") {
    try {
      await prisma.modePaiement.delete({
        where: { id: idNum },
      });
      res.status(200).json({ message: "Mode de paiement supprimé avec succès" });
    } catch (error) {
      if (error.code === "P2025") return res.status(404).json({ message: "Mode de paiement non trouvé" });
      if (process.env.NODE_ENV === "development") console.error("Suppression mode paiement:", error?.message);
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).json({ message: "Méthode non autorisée" });
  }
}
