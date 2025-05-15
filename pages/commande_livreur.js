import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout_livreur from '../components/Layout_Livreur';
import { MapPin, Phone, User, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LivreurPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commandes, setCommandes] = useState([]);
  const [validatingId, setValidatingId] = useState(null);
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
    setValidatingId(commandeId);
    try {
      const res = await fetch("/api/commande-livreur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commande_id: commandeId }),
      });

      if (res.ok) {
        setCommandes(prev => prev.filter(cmd => cmd.id !== commandeId));
      } else {
        console.error("Échec validation commande");
      }
    } catch (err) {
      console.error("Erreur serveur:", err);
    } finally {
      setValidatingId(null);
    }
  };

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <Layout_livreur>
      <div className="min-h-screen bg-gray-50 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Package className="text-green-600" size={28} />
            Commandes à livrer
          </h1>
          <p className="text-gray-500 mt-2">
            Liste des commandes assignées à votre livraison
          </p>
        </motion.div>

        {commandes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center"
          >
            <Package className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Aucune commande en attente
            </h3>
            <p className="mt-1 text-gray-500">
              Vous n,avez actuellement aucune commande à livrer
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {commandes.map((cmd, index) => (
              <motion.div
                key={cmd.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Commande #{cmd.id}
                        </h3>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          En attente de livraison
                        </span>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-green-50 p-2 rounded-lg">
                            <User className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Client</p>
                            <p className="font-medium">
                              {cmd.client_prenom} {cmd.client_nom}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-blue-50 p-2 rounded-lg">
                            <Phone className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Téléphone</p>
                            <p className="font-medium">{cmd.telephone}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-purple-50 p-2 rounded-lg">
                            <MapPin className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Adresse</p>
                            <p className="font-medium">{cmd.adresse}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Montant total</p>
                        <p className="text-xl font-semibold text-green-600">
                          {cmd.total.toLocaleString('fr-FR')} FCFA
                        </p>
                      </div>
                      <button
                        onClick={() => validerCommande(cmd.id)}
                        disabled={validatingId === cmd.id}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                          validatingId === cmd.id
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {validatingId === cmd.id ? (
                          <>
                            Validation...
                          </>
                        ) : (
                          <>
                            Valider la livraison
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout_livreur>
  );
}