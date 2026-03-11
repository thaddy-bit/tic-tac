import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const {
        client_nom,
        user_id,
        chauffeur_id,
        automobile_id,
        total,
        livraison,
        statut,
        produits, // [{ produit_id, quantite, prix, pharmacie_nom }]
      } = req.body;

      // Validation des champs de base
      if (!client_nom || !user_id) {
        return res.status(400).json({ message: 'Le nom du client et l\'utilisateur sont obligatoires' });
      }

      if (!Array.isArray(produits) || produits.length === 0) {
        return res.status(400).json({ message: 'Aucun produit fourni pour la commande' });
      }

      const commande = await prisma.commande.create({
        data: {
          client_nom,
          telephone: '',
          user_id: parseInt(user_id, 10),
          chauffeur_id: chauffeur_id ? parseInt(chauffeur_id, 10) : null,
          automobile_id: automobile_id ? parseInt(automobile_id, 10) : null,
          total: total || 0,
          livraison: livraison || 0,
          statut: (statut === 'en_attente' ? 'en_cours' : statut) || 'en_cours',
          adresse: '',
        },
      });

      for (const item of produits) {
        const { produit_id, quantite, prix, pharmacie_nom } = item;
        if (!produit_id || !quantite || !prix || !pharmacie_nom) {
          return res.status(400).json({ message: 'Chaque produit doit contenir produit_id, quantite, prix, et pharmacie_nom' });
        }
        await prisma.commandeDetail.create({
          data: { commande_id: commande.id, produit_id, quantite, prix, pharmacie_nom },
        });
      }

      res.status(201).json({ id: commande.id, message: 'Commande et détails enregistrés avec succès' });

    } catch (error) {
      console.error('Erreur lors de la création de la commande :', error);
      res.status(500).json({ message: 'Erreur serveur lors de la création de la commande' });
    }
  }

  // Récupération des commandes
  else if (req.method === 'GET') {
    try {
      const rows = await prisma.commande.findMany({
        include: {
          user: { select: { nom: true, prenom: true } },
          automobile: { select: { nom: true, matriculation: true } },
        },
        orderBy: { date_commande: 'desc' },
      });
      const formatted = rows.map((c) => ({
        ...c,
        user_nom: c.user?.nom,
        user_prenom: c.user?.prenom,
        chauffeur_nom: null,
        chauffeur_prenom: null,
        auto_nom: c.automobile?.nom,
        matriculation: c.automobile?.matriculation,
      }));
      res.status(200).json(formatted);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes :', error);
      res.status(500).json({ message: 'Erreur serveur lors de la récupération des commandes' });
    }
  }
  // terminer la commande par le livreur
  else if (req.method === 'PUT') {
    try {
      const { commande_id, chauffeur_id } = req.body;

      if (!commande_id || !chauffeur_id) {
        return res.status(400).json({ message: 'commande_id et chauffeur_id sont requis' });
      }

      const check = await prisma.commande.findFirst({
        where: { id: parseInt(commande_id, 10), chauffeur_id: parseInt(chauffeur_id, 10) },
      });
      if (!check) return res.status(403).json({ message: 'Accès interdit ou commande non trouvée' });

      await prisma.commande.update({
        where: { id: parseInt(commande_id, 10) },
        data: { statut: 'livre' },
      });

      res.status(200).json({ message: 'Commande livrée avec succès' });

    } catch (error) {
      console.error('Erreur lors de la mise à jour de la commande :', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }


  // Méthode non autorisée
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Méthode ${req.method} non autorisée`);
  }
}