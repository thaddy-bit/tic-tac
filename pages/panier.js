import Layout from '../components/Layout';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function PanierPage() {
  const [panier, setPanier] = useState([]);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true); // Ajouté

  async function supprimerCodeValidation() {
    try {
      const response = await fetch('/api/auth/suppressionValidation', {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Code de validation supprimé automatiquement');
        // Optionnel : mettre à jour l’état local, rediriger, etc.
      } else {
        console.error('Erreur :', data.message);
      }
    } catch (error) {
      console.error('Erreur de requête :', error);
    }
  } 

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/login"); // remplace au lieu de "push"
          return; // stoppe la fonction ici
        }
        const data = await res.json();
        setUser(data);
      } catch {
        router.replace("/login"); // idem ici
      } finally {
        setLoadingUser(false);
      }
    };
    // suppression du code de validation
    supprimerCodeValidation();

    fetchUser();
  }, [router]);
 

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('panier') || '[]');
    setPanier(stored);
  }, []);

  const updateQuantite = (id, newQuantite) => {
    const updated = panier.map((item) =>
      item.id === id ? { ...item, quantite: newQuantite } : item
    );
    setPanier(updated);
    localStorage.setItem('panier', JSON.stringify(updated));
  };

  const supprimerProduit = (id) => {
    const updated = panier.filter((item) => item.id !== id);
    setPanier(updated);
    localStorage.setItem('panier', JSON.stringify(updated));
  };

  const total = panier.reduce((acc, item) => acc + item.quantite * item.prix, 0);

  // Ajoute ce bloc juste avant le return principal :
  if (loadingUser || !user) {
    return <div className="text-center py-10">Chargement...</div>;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-10 text-green-700 text-center">🛒 Mon Panier </h1>

        {panier.length === 0 ? (
          <div className="text-center text-gray-500 text-lg">
            Votre panier est vide pour le moment...
          </div>
        ) : (
          <div className="grid gap-6">
            {panier.map((item) => (
              <div
                key={item.id}
                className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition duration-300"
              >
                {/* Partie Gauche : infos produit */}
                <div className="flex-1 w-full">
                  <h2 className="text-xl font-semibold text-green-800">{item.nom}</h2>
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {item.pharmacie_nom}
                    </span>
                    <span>Prix : <strong>{item.prix} FCFA</strong></span>
                  </div>
                </div>

                {/* Partie Droite : Quantité + Bouton Supprimer */}
                <div className="flex flex-col items-center gap-3 mt-6 md:mt-0">
                  <input
                    type="number"
                    value={item.quantite}
                    min="1"
                    className="w-20 border-2 border-green-400 rounded-xl p-2 text-center focus:outline-none focus:ring-2 focus:ring-green-500"
                    onChange={(e) => updateQuantite(item.id, parseInt(e.target.value))}
                  />
                  <button
                    onClick={() => supprimerProduit(item.id)}
                    className="text-red-500 hover:text-red-600 text-sm underline transition"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}

            {/* Résumé total */}
            <div className="bg-green-100 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center mt-8">
              <div className="text-lg font-semibold text-green-800">
                Total à payer : {total.toFixed(0)} FCFA
              </div>
              <Link href="/commandes">
                <button className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition">
                  Passer la commande
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}