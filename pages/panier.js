import Layout from '../components/Layout';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PanierPage() {
  const [panier, setPanier] = useState([]);

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

  return (
    <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-green-700">🛒 Mon Panier</h1>

      {panier.length === 0 ? (
        <p className="text-gray-600">Votre panier est vide.</p>
      ) : (
        <div className="space-y-6">
          {panier.map((item) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-4 rounded shadow"
            >
              <div>
                <h2 className="text-lg font-semibold text-green-800">{item.nom}</h2>
                <p className="text-sm text-gray-500">{item.description}</p>
                <p className="text-sm text-gray-600">Prix : {item.prix} FCFA</p>
                <p className="text-sm text-gray-600">{item.pharmacie_nom}</p>
              </div>

              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <input
                  type="number"
                  value={item.quantite}
                  min="1"
                  className="w-16 border rounded p-1 text-center"
                  onChange={(e) => updateQuantite(item.id, parseInt(e.target.value))}
                />
                <button
                  onClick={() => supprimerProduit(item.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}

          <div className="text-right mt-6 text-lg font-bold text-green-700">
            Total : {total.toFixed(0)} FCFA
          </div>

          <div className="text-right">
            <Link href="/commandes">
              <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
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
