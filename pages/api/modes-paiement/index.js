import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authApi";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const user = await requireAdmin(req, res);
    if (!user) return;
  }

  if (req.method === "GET") {
    try {
      const actifOnly = req.query.actif === "1" || req.query.actif === "true";
      const rows = await prisma.modePaiement.findMany({
        where: actifOnly ? { actif: true } : undefined,
        orderBy: [{ ordre: "asc" }, { nom: "asc" }],
      });
      const formatted = rows.map((m) => ({
        id: m.id,
        nom: m.nom,
        code: m.code,
        type: m.type,
        actif: m.actif,
        ordre: m.ordre,
        description: m.description,
        instructions: m.instructions,
        logo_url: m.logo_url,
        config_public: m.config_public,
        created_at: m.created_at,
        updated_at: m.updated_at,
      }));
      res.status(200).json(formatted);
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Liste modes paiement:", error?.message);
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else if (req.method === "POST") {
    const { nom, code, type, actif, ordre, description, instructions, logo_url, config_public } = req.body;

    if (!nom || !code || typeof code !== "string") {
      return res.status(400).json({ message: "Nom et code sont requis" });
    }

    const codeNorm = code.trim().toLowerCase().replace(/\s+/g, "_");
    if (!codeNorm) {
      return res.status(400).json({ message: "Code invalide" });
    }

    try {
      const mode = await prisma.modePaiement.create({
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
      res.status(201).json({ message: "Mode de paiement créé avec succès", id: mode.id });
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Création mode paiement:", error?.message);
      if (error.code === "P2002") {
        return res.status(400).json({ message: "Un mode de paiement avec ce code existe déjà" });
      }
      if (error.code === "P2003") return res.status(400).json({ message: "Données invalides" });
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else {
    res.status(405).json({ message: "Méthode non autorisée" });
  }
}
