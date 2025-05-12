import { pool } from '@/lib/db';

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

      // Insertion de la commande principale
      const [result] = await pool.query(
        'INSERT INTO commande (client_nom, user_id, chauffeur_id, automobile_id, total, livraison, statut, date_commande) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [client_nom, user_id, chauffeur_id || null, automobile_id || null, total || 0, livraison || 0, statut || 'en_attente']
      );

      const commandeId = result.insertId;

      // Insertion des détails de la commande
      for (const item of produits) {
        const { produit_id, quantite, prix, pharmacie_nom } = item;

        if (!produit_id || !quantite || !prix || !pharmacie_nom) {
          return res.status(400).json({ message: 'Chaque produit doit contenir produit_id, quantite, prix, et pharmacie_nom' });
        }

        await pool.query(
          'INSERT INTO commande_details (commande_id, produit_id, quantite, prix, pharmacie_nom) VALUES (?, ?, ?, ?, ?)',
          [commandeId, produit_id, quantite, prix, pharmacie_nom]
        );
      }

      res.status(201).json({
        id: commandeId,
        message: 'Commande et détails enregistrés avec succès'
      });

    } catch (error) {
      console.error('Erreur lors de la création de la commande :', error);
      res.status(500).json({ message: 'Erreur serveur lors de la création de la commande' });
    }
  }

  // Récupération des commandes
  else if (req.method === 'GET') {
    try {
      const [rows] = await pool.query(`
        SELECT c.*, 
               u.nom as user_nom, u.prenom as user_prenom,
               ch.nom as chauffeur_nom, ch.prenom as chauffeur_prenom,
               a.nom as auto_nom, a.matriculation
        FROM commande c
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN chauffeur ch ON c.chauffeur_id = ch.id
        LEFT JOIN automobile a ON c.automobile_id = a.id
        ORDER BY c.date_commande DESC
      `);
      res.status(200).json(rows);
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

      // Vérifie que la commande appartient bien au livreur
      const [check] = await pool.query('SELECT * FROM commande WHERE id = ? AND chauffeur_id = ?', [commande_id, chauffeur_id]);

      if (check.length === 0) {
        return res.status(403).json({ message: 'Accès interdit ou commande non trouvée' });
      }

      // Mise à jour du statut
      await pool.query('UPDATE commande SET statut = "livrée" WHERE id = ?', [commande_id]);

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