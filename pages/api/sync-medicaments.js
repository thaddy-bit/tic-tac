import { pool } from '@/lib/db';

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
    const promises = medicaments.map((m) => {
      return pool.query(
        `INSERT INTO medicaments (
          Reference, Nom, presentation, description,
          prixAchat, prixVente, quantite, pharmacie_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          Nom = VALUES(Nom),
          presentation = VALUES(presentation),
          description = VALUES(description),
          prixAchat = VALUES(prixAchat),
          prixVente = VALUES(prixVente),
          quantite = VALUES(quantite),
          pharmacie_id = VALUES(pharmacie_id)`,
        [
          m.Reference,
          m.Nom,
          m.presentation || '',
          m.description || '',
          parseInt(m.prixAchat),
          parseInt(m.prixVente),
          parseInt(m.quantite),
          pharmacie_id
        ]
      );
    });

    await Promise.all(promises);

    res.status(200).json({ success: true, message: 'Médicaments synchronisés avec succès ✅' });
  } catch (error) {
    console.error('Erreur de synchronisation:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde', error: error.message });
  }
}