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
    for (const m of medicaments) {
      if (!m.Reference) {
        console.error('Médicament sans Reference:', m);
        continue; // Skip les médicaments sans Reference
      }

      const [existing] = await pool.query(
        'SELECT * FROM medicaments WHERE Reference = ? AND pharmacie_id = ?',
        [m.Reference, pharmacie_id]
      );

      if (existing.length > 0) {
        // Mise à jour si nécessaire
        const med = existing[0];
        if (med.quantite !== parseInt(m.quantite) || med.prixVente !== parseFloat(m.prixVente)) {
          await pool.query(
            `UPDATE medicaments SET
              Nom = ?,
              presentation = ?,
              description = ?,
              prixAchat = ?,
              prixVente = ?,
              quantite = ?
             WHERE id = ?`,
            [
              m.Nom,
              m.presentation || '',
              m.description || '',
              parseFloat(m.prixAchat),
              parseFloat(m.prixVente),
              parseInt(m.quantite),
              med.id
            ]
          );
        }
        // on fais rien si le médicament n'a pas changé
      } else {
        // Insertion
        await pool.query(
          `INSERT INTO medicaments (
            Reference, Nom, presentation, description,
            prixAchat, prixVente, quantite, pharmacie_id, pharmacie_nom
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            m.Reference,
            m.Nom,
            m.presentation || '',
            m.description || '',
            parseFloat(m.prixAchat),
            parseFloat(m.prixVente),
            parseInt(m.quantite),
            pharmacie_id, 
            m.pharmacie_nom
          ]
        );
      }
    }

    res.status(200).json({ success: true, message: 'Synchronisation réussie ✅' });
  } catch (error) {
    console.error('Erreur de synchronisation:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
}