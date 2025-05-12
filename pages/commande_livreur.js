import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout_livreur from '../components/Layout_Livreur';

export default function LivreurPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commandes, setCommandes] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) return router.push("/login");
        const data = await res.json();
        setUser(data);
        fetchCommandes(data.id);
      } catch {
        router.push("/login");
      }
    };

    const fetchCommandes = async (chauffeurId) => {
      try {
        const res = await fetch(`/api/commande-livreur?chauffeur_id=${chauffeurId}`);
        const data = await res.json();
        setCommandes(data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur chargement commandes livreur:", error);
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const validerCommande = async (commandeId) => {
    try {
      const res = await fetch("/api/commande-livreur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commande_id: commandeId }),
      });

      if (res.ok) {
        // Mise à jour de la liste sans la commande validée
        setCommandes(prev => prev.filter(cmd => cmd.id !== commandeId));
      } else {
        console.error("Échec validation commande");
      }
    } catch (err) {
      console.error("Erreur serveur:", err);
    }
  };

  if (loading && !user) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  return (
    <Layout_livreur>
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-2xl font-semibold mb-4">Commandes en attente</h1>

        {commandes.length === 0 ? (
          <p className="text-gray-600">Aucune commande en attente.</p>
        ) : (
          <div className="grid gap-4">
            {commandes.map((cmd) => (
              <div key={cmd.id} className="bg-white rounded-xl shadow p-4 lg:flex space-y-5 justify-between items-center">
                <div>
                  <p className="text-lg font-bold">Commande #{cmd.id} de : {cmd.client_nom} {cmd.client_prenom}</p>
                  <p className="text-sm text-gray-500">Montant : {cmd.total} FCFA</p>
                  <p className="text-sm text-gray-500">Téléphone : {cmd.telephone}</p>
                  <p className="text-sm text-gray-500">Adresse : {cmd.adresse}</p>
                </div>
                <button
                  onClick={() => validerCommande(cmd.id)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow"
                >
                  Valider la livraison
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout_livreur>
  );
}