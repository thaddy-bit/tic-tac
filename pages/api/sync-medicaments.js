import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.SYNC_API_KEY) {
    return res.status(401).json({ success: false, message: 'Clé API invalide' });
  }

  const { pharmacie_id, medicaments } = req.body;

  if (!pharmacie_id || !Array.isArray(medicaments)) {
    return res.status(400).json({ success: false, message: 'Données invalides' });
  }

  try {
    for (const m of medicaments) {
      if (!m.Reference) {
        console.error('Médicament sans Reference:', m);
        continue; // Skip les médicaments sans Reference
      }

      const existing = await prisma.medicament.findFirst({
        where: { Reference: m.Reference, pharmacie_id: parseInt(pharmacie_id, 10) },
      });

      if (existing) {
        if (existing.quantite !== parseInt(m.quantite, 10) || existing.prixVente !== parseFloat(m.prixVente)) {
          await prisma.medicament.update({
            where: { id: existing.id },
            data: {
              Nom: m.Nom,
              presentation: m.presentation || '',
              description: m.description || '',
              prixAchat: parseFloat(m.prixAchat),
              prixVente: parseFloat(m.prixVente),
              quantite: parseInt(m.quantite, 10),
            },
          });
        }
      } else {
        await prisma.medicament.create({
          data: {
            Reference: m.Reference,
            Nom: m.Nom,
            presentation: m.presentation || '',
            description: m.description || '',
            prixAchat: parseFloat(m.prixAchat),
            prixVente: parseFloat(m.prixVente),
            quantite: parseInt(m.quantite, 10),
            pharmacie_id: parseInt(pharmacie_id, 10),
            pharmacie_nom: m.pharmacie_nom || '',
          },
        });
      }
    }

    res.status(200).json({ success: true, message: 'Synchronisation réussie ✅' });
  } catch (error) {
    console.error('Erreur de synchronisation:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
}