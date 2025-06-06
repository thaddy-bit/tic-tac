import { pool } from '@/lib/db';
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    nomPatient,
    telephone,
    livraison,
    panier,
    total,
    userId,
    automobileId,
    chauffeurId,
    adresse,
  } = req.body;

  if (!nomPatient || !Array.isArray(panier) || panier.length === 0 || livraison < 0) {
    return res.status(400).json({ error: 'Données invalides.' });
  }

  const connection = await pool.getConnection();

  try {
    // 🔎 Vérifier les stocks avant de commencer la transaction
    for (const item of panier) {
      const [rows] = await connection.query(
        `SELECT quantite FROM medicaments WHERE id = ?`,
        [item.id]
      );

      if (rows.length === 0) {
        return res.status(400).json({ error: `Médicament ID ${item.id} introuvable.` });
      }

      const stockDisponible = rows[0].quantite;

      if (stockDisponible < item.quantite) {
        return res.status(400).json({
          error: `Stock insuffisant pour ${item.Nom}. Stock : ${stockDisponible}, demandé : ${item.quantite}`
        });
      }
    }

    await connection.beginTransaction();

    // 📝 Insertion dans la table commandes
    const [commandeResult] = await connection.query(
      `INSERT INTO commandes (client_nom, telephone, user_id, chauffeur_id, automobile_id, total, livraison, statut, adresse)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'en cours', ?)`,
      [nomPatient, telephone, userId, chauffeurId, automobileId, total, livraison, adresse]
    );
    const commandeId = commandeResult.insertId;

    // 🧾 Insertion des détails et décrémentation du stock
    for (const item of panier) {
      await connection.query(
        `INSERT INTO commande_details (commande_id, produit_id, quantite, prix, pharmacie_nom)
         VALUES (?, ?, ?, ?, ?)`,
        [commandeId, item.id, item.quantite, item.prix, item.pharmacie_nom]
      );

      await connection.query(
        `UPDATE medicaments SET quantite = quantite - ? WHERE id = ?`,
        [item.quantite, item.id]
      );
    }

    await connection.commit();

    // 📩 Envoi du récapitulatif WhatsApp
    let messageBody = `🧾 Nouvelle commande enregistrée\n`;
    messageBody += `👤 Patient : ${nomPatient}\n`;
    messageBody += `🚗 Véhicule : ${automobileId}\n`;
    messageBody += `🧍‍♂️ Chauffeur : ${chauffeurId}\n`;
    messageBody += `📦 Produits :\n`;

    for (const item of panier) {
      messageBody += `- ${item.nom} × ${item.quantite} (${item.prix * item.quantite} FCFA)\n`;
    }

    messageBody += `🚚 Livraison : ${livraison} FCFA\n`;
    messageBody += `💰 Total : ${total} FCFA`;

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: process.env.DESTINATAIRE_WHATSAPP,
      body: messageBody,
    });

    res.status(200).json({ message: 'Commande enregistrée et stock mis à jour.' });
  } catch (error) {
    console.error('Erreur commande :', error);
    await connection.rollback();
    res.status(500).json({ error: 'Erreur lors de l’enregistrement de la commande.' });
  } finally {
    connection.release();
  }
}