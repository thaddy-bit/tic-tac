import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout_livreur from '../components/Layout_Livreur';
import { MapPin, Phone, User, Package, Eye, ArrowRight, CheckCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LivreurPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commandes, setCommandes] = useState([]);
  const [validatingId, setValidatingId] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState({});
  const [commandeDetails, setCommandeDetails] = useState({});
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

  const toggleDetails = async (commandeId) => {
    setDetailsVisible(prev => ({
      ...prev,
      [commandeId]: !prev[commandeId],
    }));

    if (!commandeDetails[commandeId]) {
      try {
        const res = await fetch(`/api/commande-details?commande_id=${commandeId}`);
        const data = await res.json();
        setCommandeDetails(prev => ({
          ...prev,
          [commandeId]: data,
        }));
      } catch (error) {
        console.error("Erreur chargement détails commande:", error);
      }
    }
  };

  // Calculer le nombre total d'articles pour une commande
  const getTotalArticles = (details) => {
    if (!details) return 0;
    return details.reduce((total, item) => total + item.quantite, 0);
  };

  // Calculer le montant total par pharmacie
  /*
  const getMontantParPharmacie = (details) => {
    if (!details) return [];
    
    const pharmacieMap = new Map();
    
    details.forEach(item => {
      const current = pharmacieMap.get(item.pharmacie_id) || {
        nom: item.pharmacie_nom,
        montant: 0,
        articles: 0
      };
      
      pharmacieMap.set(item.pharmacie_id, {
        ...current,
        montant: current.montant + (item.prix_vente * item.quantite),
        articles: current.articles + item.quantite
      });
    });
    
    return Array.from(pharmacieMap.values());
  };
  */

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <Layout_livreur>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Package className="text-green-600" size={28} />
                Commandes à livrer
              </h1>
              <p className="text-gray-500 mt-2">
                Liste des commandes assignées à votre livraison
              </p>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg flex items-center gap-2">
              <Info className="text-blue-600" size={20} />
              <span className="text-blue-700">
                {commandes.length} commande{commandes.length !== 1 ? 's' : ''} en attente
              </span>
            </div>
          </div>
        </motion.div>

        {commandes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12 text-center"
          >
            <div className="flex justify-center">
              <div className="bg-gray-100 p-4 rounded-full">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Aucune commande en attente
            </h3>
            <p className="mt-1 text-gray-500">
              Vous n&apos;avez actuellement aucune commande à livrer
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {commandes.map((cmd, index) => {
              const details = commandeDetails[cmd.id] || [];
              // const pharmacies = getMontantParPharmacie(details);
              const totalArticles = getTotalArticles(details);
              
              return (
                <motion.div
                  key={cmd.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Commande #{cmd.id}
                          </h3>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            En attente de livraison
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Carte Client */}
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="bg-green-100 p-2 rounded-full">
                                <User className="h-5 w-5 text-green-600" />
                              </div>
                              <h4 className="font-medium text-gray-700">Client</h4>
                            </div>
                            <p className="text-gray-900 font-semibold">
                              {cmd.client_prenom} {cmd.client_nom}
                            </p>
                          </div>
                          
                          {/* Carte Contact */}
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="bg-blue-100 p-2 rounded-full">
                                <Phone className="h-5 w-5 text-blue-600" />
                              </div>
                              <h4 className="font-medium text-gray-700">Contact</h4>
                            </div>
                            <p className="text-gray-900 font-semibold">{cmd.telephone}</p>
                          </div>
                          
                          {/* Carte Adresse */}
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="bg-purple-100 p-2 rounded-full">
                                <MapPin className="h-5 w-5 text-purple-600" />
                              </div>
                              <h4 className="font-medium text-gray-700">Adresse</h4>
                            </div>
                            <p className="text-gray-900 font-semibold">{cmd.adresse}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Montant total</p>
                          <p className="text-xl font-semibold text-green-600">
                            {cmd.total.toLocaleString('fr-FR')} FCFA
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={() => validerCommande(cmd.id)}
                            disabled={validatingId === cmd.id}
                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                              validatingId === cmd.id
                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            } w-full md:w-auto`}
                          >
                            {validatingId === cmd.id ? (
                              <span className="flex items-center">
                                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                                Validation...
                              </span>
                            ) : (
                              <>
                                <CheckCircle size={18} className="mr-1" />
                                Valider la livraison
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => toggleDetails(cmd.id)}
                            className={`flex items-center gap-1 text-sm ${
                              detailsVisible[cmd.id] 
                                ? 'text-blue-700 font-medium' 
                                : 'text-blue-600'
                            }`}
                          >
                            <Eye size={16} className="mr-1" />
                            {detailsVisible[cmd.id] ? "Masquer détails" : "Voir détails"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {detailsVisible[cmd.id] && (
                      <div className="mt-6 border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-800">
                            Détails de la commande
                          </h4>
                          <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                            {totalArticles} article{totalArticles !== 1 ? 's' : ''} au total
                          </span>
                        </div>
                        
                        {commandeDetails[cmd.id] ? (
                          <div className="space-y-6">
                            {/* Résumé par pharmacie */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                              
                            </div>
                            
                            {/* Détails des produits */}
                            <div>
                              <h5 className="font-medium text-gray-700 mb-3">Articles à récupérer</h5>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-gray-500">Pharmacie</th>
                                      <th className="px-4 py-2 text-left text-gray-500">Médicament</th>
                                      <th className="px-4 py-2 text-center text-gray-500">Quantité</th>
                                      <th className="px-4 py-2 text-right text-gray-500">Prix unitaire</th>
                                      <th className="px-4 py-2 text-right text-gray-500">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {details.map((detail, idx) => (
                                      <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{detail.pharmacie_nom}</td>
                                        <td className="px-4 py-3">
                                          <div className="font-medium">{detail.produit_nom}</div>
                                          <div className="text-xs text-gray-500">{detail.categorie}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center">{detail.quantite}</td>
                                        <td className="px-4 py-3 text-right">{detail.prix_vente.toLocaleString('fr-FR')} FCFA</td>
                                        <td className="px-4 py-3 text-right font-medium">
                                          {(detail.prix_vente * detail.quantite).toLocaleString('fr-FR')} FCFA
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot className="bg-gray-50 border-t">
                                    <tr>
                                      <td colSpan="4" className="px-4 py-3 text-right font-medium">Total commande</td>
                                      <td className="px-4 py-3 text-right font-bold text-green-600">
                                        {cmd.total.toLocaleString('fr-FR')} FCFA
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                            
                            {/* Instructions de livraison */}
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                              <h5 className="font-medium text-yellow-800 mb-2">Instructions de livraison</h5>
                              <div className="flex items-start gap-2">
                                <ArrowRight className="text-yellow-600 mt-0.5 flex-shrink-0" size={16} />
                                <p className="text-sm text-yellow-700">
                                  Livrer avant 18h. Le client sera absent entre 12h et 14h.
                                  Appeler avant d&apos;arriver. Le colis contient des produits fragiles.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout_livreur>
  );
}




