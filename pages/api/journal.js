import { pool } from '@/lib/db'; // adapte selon ton fichier de connexion à MySQL

export default async function handler(req, res) {
  const user_id = req.body.user_id;  // Récupérer user_id dans le body pour un POST
  
  console.log("ID Utilisateur reçu :", user_id);  // Vérifie si l'ID est bien transmis
  
  if (req.method !== "POST") {  // Change ici pour accepter POST
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  if (!user_id) {
    return res.status(400).json({ message: "User ID manquant" });
  }

  try {
    const [commandes] = await pool.query(
      "SELECT * FROM commandes WHERE user_id = ? ORDER BY date_commande DESC",
      [user_id]
    );
    
    if (commandes.length === 0) {
      return res.status(404).json({ message: "Aucune commande trouvée pour cet utilisateur" });
    }

    res.status(200).json(commandes);
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}