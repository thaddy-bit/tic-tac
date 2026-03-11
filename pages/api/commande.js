import { prisma } from '@/lib/prisma';
import twilio from 'twilio';

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

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

  try {
    for (const item of panier) {
      const med = await prisma.medicament.findUnique({
        where: { id: item.id },
        select: { quantite: true, Nom: true },
      });
      if (!med) {
        return res.status(400).json({ error: `Médicament ID ${item.id} introuvable.` });
      }
      if (med.quantite < item.quantite) {
        return res.status(400).json({
          error: `Stock insuffisant pour ${item.Nom ?? med.Nom}. Stock : ${med.quantite}, demandé : ${item.quantite}`,
        });
      }
    }

    await prisma.$transaction(async (tx) => {
      const commande = await tx.commande.create({
        data: {
          client_nom: nomPatient,
          telephone: String(telephone),
          user_id: parseInt(userId, 10),
          chauffeur_id: parseInt(chauffeurId, 10),
          automobile_id: parseInt(automobileId, 10),
          total: parseInt(total, 10),
          livraison: parseInt(livraison, 10),
          statut: 'en_cours',
          adresse: adresse || '',
        },
      });

      for (const item of panier) {
        await tx.commandeDetail.create({
          data: {
            commande_id: commande.id,
            produit_id: item.id,
            quantite: item.quantite,
            prix: item.prix,
            pharmacie_nom: item.pharmacie_nom ?? '',
          },
        });
        await tx.medicament.update({
          where: { id: item.id },
          data: { quantite: { decrement: item.quantite } },
        });
      }
    });

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

    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: process.env.DESTINATAIRE_WHATSAPP,
      body: messageBody,
    });

    res.status(200).json({ message: 'Commande enregistrée et stock mis à jour.' });
  } catch (error) {
    console.error('Erreur commande :', error);
    res.status(500).json({ error: 'Erreur lors de l’enregistrement de la commande.' });
  }
}