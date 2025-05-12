import { useEffect, useState } from "react";
import Master_livreur from "@/components/Master_livreur";

export default function CommandeLivreur({ chauffeurId }) {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/commande-livreur?chauffeur_id=${chauffeurId}`);
      const data = await res.json();
      setCommandes(data);
    } catch (error) {
      console.error("Erreur lors du chargement des commandes :", error);
    } finally {
      setLoading(false);
    }
  };

  const validerCommande = async (commandeId) => {
    try {
      const res = await fetch(`/api/commande-livreur`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commande_id: commandeId }),
      });

      const data = await res.json();
      if (res.ok) {
        setCommandes(prev => prev.filter(c => c.id !== commandeId));
      } else {
        alert(data.message || "Erreur lors de la validation");
      }
    } catch (error) {
      console.error("Erreur validation :", error);
    }
  };

  useEffect(() => {
    fetchCommandes();
  }, [chauffeurId]);

  return (
    <Master_livreur>
        <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">Commandes en attente</h1>

        {loading ? (
            <div className="text-center text-gray-500">Chargement...</div>
        ) : commandes.length === 0 ? (
            <div className="text-center text-gray-400">Aucune commande en attente</div>
        ) : (
            <div className="grid gap-4">
            {commandes.map((commande) => (
                <div key={commande.id} className="bg-white shadow rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-2 md:mb-0">
                    <p className="text-lg font-semibold">{commande.client_nom} {commande.client_prenom}</p>
                    <p className="text-sm text-gray-500">Total : {commande.total} FCFA</p>
                    <p className="text-sm text-gray-400">Commande #{commande.id}</p>
                </div>
                <button
                    onClick={() => validerCommande(commande.id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                    ✅ Valider
                </button>
                </div>
            ))}
            </div>
        )}
        </div>
    </Master_livreur>
  );
}