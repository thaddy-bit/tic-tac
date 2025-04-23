import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
import Layout from '../../components/Layout';

export default function AjoutCommande() {
  const [users, setUsers] = useState([]);
  const [panier, setPanier] = useState([]);
  const [chauffeurs, setChauffeurs] = useState([]);
  const [automobiles, setAutomobiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [livraison, setLivraison] = useState(0);
  const [message, setMessage] = useState('');
  const totalProduits = panier.reduce((acc, item) => acc + item.quantite * item.prix, 0);
  const totalFinal = totalProduits + parseFloat(livraison || 0);
  const router = useRouter();

  const [formData, setFormData] = useState({
    client_nom: '',
    user_id: '',
    chauffeur_id: '',
    automobile_id: '',
    total: totalFinal,
    livraison: 0,
    statut: 'en_attente',
    panier: panier,
  });

  // liste des produits du panier
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('panier') || '[]');
    setPanier(stored);
  }, []);

  // Charger les données nécessaires
  useEffect(() => {
    async function loadData() {
      try {
        const [usersRes, chauffeursRes, automobilesRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/chauffeurs'),
          fetch('/api/automobiles')
        ]);

        const [usersData, chauffeursData, automobilesData] = await Promise.all([
          usersRes.json(),
          chauffeursRes.json(),
          automobilesRes.json()
        ]);

        setUsers(usersData);
        setChauffeurs(chauffeursData);
        setAutomobiles(automobilesData);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      }
    }

    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/commandes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la commande');
      }

      const result = await response.json();
      router.push(`/commandes/${result.id}`);
      
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Head>
          <title>Ajouter une commande</title>
        </Head>

        <h1 className="text-2xl ml-10 font-bold mb-6">Ajouter une nouvelle commande</h1>
        <div className='ml-10 mr-10 flex space-x-8'>

          {message && (
            <div className="mb-4 text-sm text-center p-2 rounded bg-green-100 text-green-700">
              {message}
            </div>
          )}

          <div className='w-150'>
            <div className="bg-white p-4 rounded shadow mt-6">
              <h2 className="font-semibold mb-2 text-green-700">🛒 Articles dans le panier :</h2>
              {panier.map((item) => (
                <div key={item.id} className="text-sm border-b py-2 flex justify-between">
                  <span>{item.nom} × {item.quantite}</span>
                  <span>{(item.prix * item.quantite)} FCFA</span>
                </div>
              ))}
              <div className="font-bold mt-4 text-right">
                Total : {totalProduits} FCFA + {livraison || 0} FCFA = {totalFinal} FCFA
              </div>

              {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p>{error}</p>
              </div>
              )}
            </div>
          </div>

          <div className='w-full bg-white p-4 rounded shadow mt-6'>
            <form onSubmit={handleSubmit} className="rounded px-8 pt-6 pb-8 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="client_nom">
                    Nom du patient *
                  </label>
                  <input
                    type="text"
                    id="client_nom"
                    name="client_nom"
                    value={formData.client_nom}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>

                {/* Utilisateur */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="user_id">
                    Responsable *
                  </label>
                  <select
                    id="user_id"
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">Sélectionner un responsable</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.prenom} {user.nom}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chauffeur */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="chauffeur_id">
                    Chauffeur
                  </label>
                  <select
                    id="chauffeur_id"
                    name="chauffeur_id"
                    value={formData.chauffeur_id}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">Sélectionner un chauffeur</option>
                    {chauffeurs.map(chauffeur => (
                      <option key={chauffeur.id} value={chauffeur.id}>
                        {chauffeur.prenom} {chauffeur.nom}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Automobile */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="automobile_id">
                    Véhicule
                  </label>
                  <select
                    id="automobile_id"
                    name="automobile_id"
                    value={formData.automobile_id}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">Sélectionner un véhicule</option>
                    {automobiles.map(auto => (
                      <option key={auto.id} value={auto.id}>
                        {auto.nom} ({auto.matriculation})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Total */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="total">
                    Montant total
                  </label>
                  <input
                    type="number"
                    id="total"
                    name="total"
                    value={formData.total}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                {/* Livraison */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="livraison">
                    Frais de livraison
                  </label>
                  <input
                    type="number"
                    id="livraison"
                    name="livraison"
                    value={livraison}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer la commande'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}