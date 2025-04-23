import { useState } from 'react';
import Layout  from '../components/Layout';
import { addToPanier } from '@/lib/panier';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Search } from 'lucide-react';
import Link from "next/link";

export default function Produits() {
  const [query, setQuery] = useState('');
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  const handleAdd = (produit) => {
    addToPanier(produit);
    setMessage(`✅ ${produit.nom} ajouté au panier`);

    // Effacer le message après 3 secondes
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
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
    } catch (err) {
      setMessage('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-gray-100">   
        <div className="relative w-full h-[450px] mt-5 overflow-hidden">
          {/* Image de fond */}
          <div className="absolute inset-0">
            <Image
              src="/pharmacie1.png" 
              priority 
              alt="logo pharmacie"
              fill
              className="object-cover"
            />
          </div>
          {/* Contenu centré */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-white text-center">
            <h1 className="text-white text-3xl md:text-5xl font-bold mb-20 drop-shadow-lg">
              Rechercher un Médicament
            </h1>

            <form 
              onSubmit={handleSearch}
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
                <Search className="text-white" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className='bg-green-100 mt-10'>
          <div className='w-full container mx-auto flex justify-center lg:space-x-9'>
            <Link href="#"
            className="text-white text-2xl lg:px-20 py-3 rounded-lg bg-green-500 p-2 transition duration-400"
            >
              Médicaments
            </Link>
            <Link href="#"
            className="text-green-500 hover:bg-green-500 hover:text-white text-2xl lg:px-20 py-3 rounded-lg p-2 transition duration-400"
            >
              Ordonance
            </Link>
            <Link href="#"
            className="hover:text-white hover:bg-green-500 text-green-500 text-2xl lg:px-20 py-3 rounded-lg p-2 transition duration-400"
            >
              Commandes
            </Link>
          </div>
        </div>

        <div className='ml-5 mt-20'>
          <h1 className='text-2xl font-bold'>Livré chez vous 7j/7, Avec ou sans ordonnance</h1>
        </div>

        <div className='ml-10 mt-10 lg:flex mr-10'>
          <div className='w-250'>
          <h1 className='text-xl'>Les catégories</h1>
          </div>

          <div className='w-full'>
          {message && <p className="text-red-600 text-center">{message}</p>}

            {produits.length > 0 && (
              <div className="space-y-4">
                {produits.map((produit) => (
                  <div key={produit.id} className="border p-4 rounded-md text-gray-100 shadow-sm bg-white">
                    <h2 className="text-xl font-semibold text-green-800">{produit.nom}</h2>
                    <p className="text-gray-700">{produit.description}</p>
                    <p className="text-sm text-gray-500">{produit.pharmacie_nom}</p>
                    <p className="font-semibold text-gray-500">Prix : {produit.prix} FCFA</p>
                    <p className="font-semibold text-gray-500">Quantité disponible : {produit.quantite}</p>
                    <button
                      onClick={() => handleAdd(produit)}
                      className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Ajouter au panier
                    </button>
                  </div>
                  
                ))}
              </div>
            )}
          </div>
        </div>

      

      
      </div>
    </Layout>
    
  );
}