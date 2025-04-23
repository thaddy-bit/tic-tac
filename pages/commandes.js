import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function CommandePage() {
  const [panier, setPanier] = useState([]);
  const [nomPatient, setNomPatient] = useState('');
  const [telephone, setTelephone] = useState('');
  const [automobiles, setAutomobiles] = useState([]);
  const [chauffeurs, setChauffeurs] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedChauffeurId, setSelectedChauffeurId] = useState('');
  const [selectedAutomobileId, setSelectedAutomobileId] = useState('');
  const [livraison, setLivraison] = useState(0);
  const [adresse, setAdresse] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
        setMessage('Erreur lors du chargement des données');
        console.error(err);
      }
    }
    loadData();
  }, []);

  const totalProduits = panier.reduce((acc, item) => acc + item.quantite * item.prix, 0);
  const totalFinal = totalProduits + parseFloat(livraison || 0);

  const handleCommande = async () => {
    if (!nomPatient || livraison < 0 || panier.length === 0 || !selectedUserId) {
      setMessage('Veuillez remplir tous les champs correctement.');
      return;
    }

    try {
      const res = await axios.post('/api/commande', {
        nomPatient,
        telephone,
        livraison,
        adresse,
        panier,
        total: totalFinal,
        userId: selectedUserId,
        automobileId: selectedAutomobileId,
        chauffeurId: selectedChauffeurId
      });

      if (res.status === 200) {
        localStorage.removeItem('panier');
        setMessage('✅ Commande enregistrée avec succès !');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (error) {
      console.error(error);
      setMessage('❌ Une erreur est survenue.');
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-green-700 mb-6">📝 Passer une commande</h1>

        {message && (
          <div className="mb-4 text-sm text-center p-2 rounded bg-green-100 text-green-700">
            {message}
          </div>
        )}

        <div className="space-x-4 lg:flex">
          <div className='bg-white p-4 rounded shadow'>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nom du patient *
            </label>
          <input
              type="text"
              placeholder="Nom du patient"
              className="w-full border p-2 rounded"
              value={nomPatient}
              required
              onChange={(e) => setNomPatient(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Téléphone du patient *
            </label>
          <input
              type="text"
              placeholder="Nom du patient"
              className="w-full border p-2 rounded"
              value={telephone}
              required
              onChange={(e) => setTelephone(e.target.value)}
            />
          </div>

            {/* Utilisateur */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Responsable *
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Sélectionner un responsable</option>
                {Array.isArray(users) && users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.prenom} {user.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Chauffeur */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Chauffeur
              </label>
              <select
                value={selectedChauffeurId}
                onChange={(e) => setSelectedChauffeurId(e.target.value)}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Sélectionner un chauffeur</option>
                {Array.isArray(chauffeurs) && chauffeurs.map(chauffeur => (
                  <option key={chauffeur.id} value={chauffeur.id}>
                    {chauffeur.prenom} {chauffeur.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Automobile */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Véhicule *
              </label>
              <select
                value={selectedAutomobileId}
                onChange={(e) => setSelectedAutomobileId(e.target.value)}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Sélectionner un véhicule</option>
                {Array.isArray(automobiles) && automobiles.map(auto => (
                  <option key={auto.id} value={auto.id}>
                    {auto.nom} ({auto.matriculation})
                  </option>
                ))}
              </select>
            </div>
            {/* Livraison */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Livraison *
              </label>
              <select
                value={livraison}
                onChange={(e) => setLivraison(e.target.value)}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Sélectionner un montant</option>
                  <option value={1000}>1 000</option>
                  <option value={1500}>1 500</option>
                  <option value={2000}>2 000</option>
                  <option value={3000}>3 000</option>
                  <option value={4000}>4 000</option>
                  <option value={5000}>5 000</option>
              </select>
            </div>
            {/* Adresse */}
            <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Adresse
            </label>
          <input
              type="text"
              placeholder="Adresse"
              className="w-full border p-2 rounded"
              value={adresse}
              required
              onChange={(e) => setAdresse(e.target.value)}
            />
          </div>
          </div>

          <div>
            <div className="bg-white p-4 rounded shadow">
              <h2 className="font-semibold mb-2 text-green-700">🛒 Articles dans le panier : ({panier.length})</h2>
              {panier.map((item) => (
                <div key={item.id} className="text-sm border-b py-2 flex justify-between">
                  <span>{item.nom} × {item.quantite}</span>
                  <span>{(item.prix * item.quantite)} FCFA</span>
                </div>
              ))}
              <div className="font-bold mt-4 text-right">
                Total : {totalProduits} FCFA + {livraison || 0} FCFA = {totalFinal} FCFA
              </div>
            </div>

          <button
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 mt-4"
            onClick={handleCommande}
          >
            Confirmer la commande
          </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}