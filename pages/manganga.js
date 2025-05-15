/////////////////////////////////

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { addToPanier } from '@/lib/panier';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [loadingUser, setLoadingUser] = useState(true); // Ajouté

  // Vérifie si l'utilisateur est connecté
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
      // vérification du code de validation pour la 1ere fois
      try {
        const res = await fetch('/api/auth/meValidation'); // Cette API doit retourner { valid: true/false }
        const data = await res.json();
        if (!data.valid) {
          router.push('/code-verification'); // Redirige vers la page de saisie du code
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
    setTimeout(() => setMessage(''), 3000);
  };

  // Charger les villes
  useEffect(() => {
    fetch('/api/produits/villes')
      .then(res => res.json())
      .then(data => setVilles(data))
      .catch(err => console.error('Erreur chargement villes:', err));
  }, []);

  // Charger les pharmacies en fonction de la ville
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

  // Fonction pour chercher les produits
  const fetchProduits = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (villeId) params.append('ville_id', villeId);
      if (pharmacieId) params.append('pharmacie_id', pharmacieId);

      const res = await fetch(`/api/produits/search?${params.toString()}`);
      const data = await res.json();

      console.log('DATA REÇUE:', data); // debug
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
      <div className="bg-gray-100">
        {/* Hero Section */}
        <div className="relative w-full h-[450px] mt-5 overflow-hidden">
          <Image
            src="/p1.png"
            alt="Pharmacie"
            fill
            priority
            className="object-cover"
          />
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center bg-opacity-50">
            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-10"
            >
              Rechercher un Médicament
            </motion.h1>
              
              <div className='lg:flex space-y-3 lg:space-x-3'>
                <div className="flex w-full max-w-2xl bg-white rounded-full shadow-lg overflow-hidden">
                <select
                  value={villeId}
                  onChange={(e) => setVilleId(e.target.value)}
                  className="ml-2 w-full py-2 outline-none text-gray-700"
                >
                  <option value="">Toutes les villes</option>
                  {villes.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nom}
                    </option>
                  ))}
                </select>
                </div>

                <div className="flex w-full max-w-2xl bg-white rounded-full shadow-lg overflow-hidden">
                <select
                  value={pharmacieId}
                  onChange={(e) => setPharmacieId(e.target.value)}
                  className="ml-2 w-full py-2 outline-none text-gray-700"
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

                <div>
                  <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                  className="flex w-full max-w-2xl bg-white rounded-full shadow-lg overflow-hidden"
                >
                  <div className="flex items-center px-4 flex-grow">
                    <Search className="text-gray-400 mr-2" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Nom ou ID du produit"
                      className="w-full py-2 outline-none text-gray-700"
                    />
                  </div>
                  <button
                    onClick={fetchProduits}
                    className="bg-green-600 px-6 flex items-center justify-center text-white hover:bg-green-700 transition"
                  >
                    <Search />
                  </button>
                  </motion.form>
                </div>
              </div>
            
          </div>
        </div>

        {/* Message de confirmation */}
        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-green-600 mt-4 text-lg"
          >
            {message}
          </motion.div>
        )}

        {/* Section Résultats */}
        <div className="mt-10 px-5">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Consultez la quantité de vos médicaments,
            commandez-les en ligne et recevez votre livraison en 10 minutes, 24h/7j
          </h2>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Filtrage catégories (non utilisé pour l'instant) */}
            <div className="w-full lg:w-1/4">
              <h3 className="text-xl mb-4 font-semibold">Les catégories</h3>
              <p className="text-gray-500">(à venir...)</p>
            </div>

            {/* Liste des produits */}
            <div className="w-full">
              {loading && <Loader />}
              {produits.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {produits.map((produit) => (
                    <motion.div
                      key={produit.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="bg-white rounded-lg shadow p-5 flex flex-col justify-between"
                    >
                      <div>
                        <h4 className="text-green-800 font-bold text-lg">{produit.Nom} || {produit.pharmacie_nom}</h4>
                        <p className="text-gray-600">{produit.presentation}</p>
                        <p className="text-red-600">Disponibilité : {produit.quantite}</p>
                      </div>

                      <button
                        onClick={() => handleAdd(produit)}
                        className="mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                      >
                        Ajouter au panier
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {!loading && produits.length === 0 && query && (
                <p className="text-center text-gray-500 mt-6">Aucun produit trouvé.</p>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </Layout>
  );
}