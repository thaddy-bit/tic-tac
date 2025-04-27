import { useState } from 'react';
import Layout from '../components/Layout';
import { addToPanier } from '@/lib/panier';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from "next/link";

export default function Produits() {
  const [query, setQuery] = useState('');
  const [produits, setProduits] = useState([]);
  const [message, setMessage] = useState('');

  const handleAdd = (produit) => {
    addToPanier(produit);
    setMessage(`✅ ${produit.nom} ajouté au panier`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setMessage('');
    setProduits([]);
    try {
      const res = await fetch(`/api/produits/search?query=${query}`);
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || 'Erreur inconnue');
      } else {
        setProduits(data);
      }
    } catch {
      setMessage('Erreur de connexion au serveur.');
    }
  };

  return (
    <Layout>
      <div className="bg-gray-100">
        {/* Hero Section */}
        <div className="relative w-full h-[450px] mt-5 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/p1.png"
              alt="Pharmacie"
              fill
              priority
              className="object-cover"
            />
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-10"
            >
              Rechercher un Médicament
            </motion.h1>

            <motion.form
              onSubmit={handleSearch}
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
                type="submit"
                className="bg-green-600 px-6 flex items-center justify-center text-white hover:bg-green-700 transition"
              >
                <Search />
              </button>
            </motion.form>
          </div>
        </div>

        {/* Navigation Options */}
        <motion.div
          className="bg-green-100 mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {/* Navigation Options
          <div className="container mx-auto flex flex-col md:flex-row justify-center items-center md:space-x-9 py-6">
            {['Médicaments', 'Ordonnance', 'Commandes'].map((item, index) => (
              <Link
                key={index}
                href="#"
                className="text-2xl px-6 py-3 my-2 md:my-0 rounded-lg transition duration-300 font-semibold text-green-500 hover:bg-green-500 hover:text-white bg-white shadow-md"
              >
                {item}
              </Link>
            ))}
          </div>
           */}
        </motion.div>

        {/* Message */}
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
            Commandez-les depuis un hôpital ou un domicile, puis recevez votre livraison en 10 minutes 24h/7j
          </h2>

          <div className="flex flex-col lg:flex-row gap-10">
            <div className="w-full lg:w-1/4">
              <h3 className="text-xl mb-4 font-semibold">Les catégories</h3>
              {/* Tu peux ajouter tes filtres ici */}
            </div>

            <div className="w-full">
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
                        <h4 className="text-green-800 font-bold text-lg">{produit.nom}</h4>
                        <p className="text-gray-600">{produit.description}</p>
                        <p className="text-sm text-gray-500">{produit.pharmacie_nom}</p>
                        <p className="font-semibold text-gray-700 mt-2">
                          Prix : {produit.prix} FCFA
                        </p>
                        <p className="text-sm text-gray-500">
                          Quantité : {produit.quantite}
                        </p>
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
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}