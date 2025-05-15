import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { addToPanier } from '@/lib/panier';
import Image from 'next/image';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '../components/Loader';
import { useRouter } from 'next/router';

export default function Produits() {
  const [villes, setVilles] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [villeId, setVilleId] = useState('');
  const [pharmacieId, setPharmacieId] = useState('');
  const [query, setQuery] = useState('');
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) return router.push("/login");
        const data = await res.json();
        setUser(data);
      } catch {
        router.push("/login");
      } finally {
        setLoadingUser(false);
      }
      try {
        const res = await fetch('/api/auth/meValidation');
        const data = await res.json();
        if (!data.valid) {
          router.push('/code-verification');
        }
      } catch (err) {
        console.error("Erreur lors de la vérification du code :", err);
      }
    };
    fetchUser();
  }, [router]);

  const handleAdd = (produit) => {
    addToPanier(produit);
    setMessage(`✅ ${produit.Nom} ajouté au panier`);
  };

  const closeModal = () => {
    setMessage('');
  };

  useEffect(() => {
    fetch('/api/produits/villes')
      .then(res => res.json())
      .then(data => setVilles(data))
      .catch(err => console.error('Erreur chargement villes:', err));
  }, []);

  useEffect(() => {
    if (!villeId) {
      setPharmacies([]);
      setPharmacieId('');
      return;
    }

    fetch(`/api/produits/pharmacies?ville_id=${villeId}`)
      .then(res => res.json())
      .then(data => {
        setPharmacies(data);
        setPharmacieId('');
      })
      .catch(err => console.error('Erreur chargement pharmacies:', err));
  }, [villeId]);

  const fetchProduits = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (villeId) params.append('ville_id', villeId);
      if (pharmacieId) params.append('pharmacie_id', pharmacieId);

      const res = await fetch(`/api/produits/search?${params.toString()}`);
      const data = await res.json();
      setProduits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur chargement produits:', err);
      setProduits([]);
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser && !user) return <div className="text-center py-10">Chargement...</div>;

  return (
    <Layout>
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
        {/* Hero Section */}
        <div className="relative w-full h-[450px] mt-5 overflow-hidden">
          <Image
            src="/p1.png"
            alt="Pharmacie"
            fill
            priority
            className="object-cover"
          />
        
          <div className="absolute inset-0 bg-opacity-40 flex items-center justify-center">
            <div className="max-w-6xl w-full px-4">
              <motion.h1 
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-3xl md:text-5xl font-bold text-white text-center mb-10"
              >
                Rechercher un Médicament
              </motion.h1>
              
              <div className="flex flex-col lg:flex-row gap-4 w-full max-w-5xl mx-auto">
                <div className="flex-1">
                  <select
                    value={villeId}
                    required
                    onChange={(e) => setVilleId(e.target.value)}
                    className="w-full px-6 py-3 rounded-full bg-white bg-opacity-90 border-none shadow-md focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="">Toutes les villes</option>
                    {villes.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <select
                    value={pharmacieId}
                    onChange={(e) => setPharmacieId(e.target.value)}
                    className="w-full px-6 py-3 rounded-full bg-white bg-opacity-90 border-none shadow-md focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-70"
                    disabled={!villeId}
                  >
                    <option value="">Toutes les pharmacies</option>
                    {pharmacies.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 relative">
                  <div className="flex w-full bg-white bg-opacity-90 rounded-full shadow-md overflow-hidden">
                    <div className="flex items-center px-6 flex-grow">
                      <Search className="text-gray-500 mr-2" />
                      <input
                        type="text"
                        required
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Nom ou ID du produit"
                        className="w-full py-3 outline-none bg-transparent text-gray-700 placeholder-gray-400"
                      />
                    </div>
                    <button
                      onClick={fetchProduits}
                      className="bg-green-600 px-6 flex items-center justify-center text-white hover:bg-green-700 transition"
                    >
                      <Search size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de confirmation */}
        <AnimatePresence>
          {message && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full relative"
              >
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Produit ajouté</h3>
                  <p className="text-gray-600 mb-6">{message.replace('✅ ', '')}</p>
                  <button
                    onClick={closeModal}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    OK
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Section Résultats */}
        <div className="container mx-auto px-4 py-12">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-bold mb-8 text-center text-gray-800"
          >
            Consultez la quantité de vos médicaments,
            <br className="hidden md:block" />
            commandez-les en ligne et recevez votre livraison en 10 minutes, 24h/7j
          </motion.h2>

          <div className="flex flex-col lg:flex-row gap-10">
            <div className="w-full lg:w-1/4">
              <h3 className="text-xl mb-4 font-semibold text-gray-700">Les catégories</h3>
              <p className="text-gray-400">(à venir...)</p>
            </div>

            <div className="w-full">
              {loading && <Loader />}
              {produits.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {produits.map((produit) => (
                    <motion.div
                      key={produit.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <h4 className="text-green-700 font-bold text-lg">{produit.Nom}</h4>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {produit.pharmacie_nom}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-2 text-sm">{produit.presentation}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className={`text-sm font-medium ${produit.quantite > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {produit.quantite > 0 ? `Disponible (${produit.quantite})` : 'Rupture de stock'}
                          </span>
                        </div>
                      </div>
                      <div className="px-6 pb-4">
                        <button
                          onClick={() => handleAdd(produit)}
                          disabled={produit.quantite <= 0}
                          className={`w-full py-2 rounded-lg font-medium transition ${produit.quantite > 0 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                        >
                          {produit.quantite > 0 ? 'Ajouter au panier' : 'Indisponible'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {!loading && produits.length === 0 && query && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Search className="text-gray-400" size={24} />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">Aucun produit trouvé</h3>
                  <p className="text-gray-500">Essayez avec d,autres termes de recherche</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}