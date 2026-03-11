import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const rows = await prisma.ville.findMany({
        include: {
          pays: { select: { id: true, nom: true } },
        },
        orderBy: { nom: 'asc' },
      });
      const formatted = rows.map((v) => ({
        id: v.id,
        nom: v.nom,
        pays_id: v.pays_id,
        pays_nom: v.pays?.nom,
      }));
      res.status(200).json(formatted);
    } catch (error) {
      console.error("Erreur liste villes:", error);
      res.status(500).json({ message: "Erreur serveur", details: error.message });
    }
  } else if (req.method === "POST") {
    const { nom, pays_id } = req.body;

    if (!nom || !pays_id) {
      return res.status(400).json({ message: "Champs requis manquants", required: ["nom", "pays_id"] });
    }

    try {
      const ville = await prisma.ville.create({
        data: { nom, pays_id: parseInt(pays_id, 10) },
      });
      res.status(201).json({ message: "Ville ajoutée avec succès", id: ville.id });
    } catch (error) {
      console.error("Erreur ajout ville:", error);
      if (error.code === 'P2003') {
        return res.status(400).json({ message: "Le pays spécifié n'existe pas" });
      }
      res.status(500).json({ message: "Erreur serveur", details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
  }
}
