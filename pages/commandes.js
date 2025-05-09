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
  
  const [selectedChauffeurId, setSelectedChauffeurId] = useState('');
  const [selectedAutomobileId, setSelectedAutomobileId] = useState('');
  const [livraison, setLivraison] = useState(0);
  const [adresse, setAdresse] = useState('');
  const [message, setMessage] = useState('');
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
        // alert("⛔ Code expiré ou invalide. Veuillez entrer un nouveau code.");
        router.push('/code-verification'); // Redirige vers la page de saisie du code
      }
    } catch (err) {
      console.error("Erreur lors de la vérification du code :", err);
    }

  };
  fetchUser();
}, [router]);

// Vérifie automatiquement toutes les 30 secondes si le code est encore valide
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/auth/meValidation'); // Cette API doit retourner { valid: true/false }
        const data = await res.json();

        if (!data.valid) {
          router.push('/code-verification'); // Redirige vers la page de saisie du code
        }
      } catch (err) {
        console.error("Erreur lors de la vérification du code :", err);
      }
    }, 30000); // 30 secondes

    return () => clearInterval(interval); // Nettoyage
  }, []);


useEffect(() => {
  const stored = JSON.parse(localStorage.getItem('panier') || '[]');
  setPanier(stored);

  async function loadData() {
    try {
      const [chauffeursRes, automobilesRes] = await Promise.all([
        fetch('/api/chauffeurs'),
        fetch('/api/automobiles')
      ]);

      const [chauffeursData, automobilesData] = await Promise.all([
        chauffeursRes.json(),
        automobilesRes.json()
      ]);

      setChauffeurs(chauffeursData);
      setAutomobiles(automobilesData);
    } catch (err) {
      setMessage('Erreur lors du chargement des données');
      console.error(err);
    }
  }

  loadData();
}, []);

  // Calculs dynamiques
  const totalProduits = panier.reduce((acc, item) => {
    const quantite = parseInt(item.quantite, 10) || 0;  // Assurez-vous que quantite est un nombre
    const prix = parseInt(item.prixVente) || 0;  // Assurez-vous que prix est un nombre
    return acc + quantite * prix;
  }, 0);
  const fraisLivraison = parseInt(livraison) || 0;
  const totalFinal = totalProduits + fraisLivraison;

  const handleCommande = async () => {
    if (!nomPatient || fraisLivraison < 0 || panier.length === 0) {
      setMessage('Veuillez remplir tous les champs correctement.');
      return;
    }

    try {
      const res = await axios.post('/api/commande', {
        nomPatient,
        telephone,
        livraison: fraisLivraison,
        adresse,
        panier,
        total: totalFinal,
        userId: user.id,
        automobileId: selectedAutomobileId,
        chauffeurId: selectedChauffeurId
      });

      if (res.status === 200) {
        localStorage.removeItem('panier');
        setMessage('✅ Commande enregistrée avec succès !');
        setTimeout(() => {
          // on supprime le code de validation
          supprimerCodeValidation();
          
          router.push('/accueil');
        }, 2000);
      }
    } catch (error) {
      console.error(error);
      setMessage('❌ Une erreur est survenue.');
    }
  };

  if (loadingUser) return <div className="text-center py-10">Chargement...</div>;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-green-700 mb-8 text-center">📝 Passer une commande</h1>

        {message && (
          <div className="mb-6 text-center p-3 rounded-md bg-green-100 text-green-700 font-medium shadow">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire de commande */}
          <div className="bg-white p-6 rounded-lg shadow-md space-y-5">
            {/* Nom du patient */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Nom du patient / client *</label>
              <input
                type="text"
                className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Jean Dupont"
                value={nomPatient}
                required
                onChange={(e) => setNomPatient(e.target.value)}
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">N°téléphone du patient / client *</label>
              <input
                type="text"
                required
                className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500"
                placeholder="Ex: 77 000 00 00"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
              />
            </div>

            {/* Chauffeur */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Nom du livreur *</label>
              <select
                value={selectedChauffeurId}
                required
                onChange={(e) => setSelectedChauffeurId(e.target.value)}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500"
              >
                <option value="">Sélectionner un livreur</option>
                {Array.isArray(chauffeurs) && chauffeurs.map((chauffeur) => (
                  <option key={chauffeur.id} value={chauffeur.id}>
                    {chauffeur.prenom} {chauffeur.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Véhicule */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Véhicule de livraison N° *</label>
              <select
                value={selectedAutomobileId}
                required
                onChange={(e) => setSelectedAutomobileId(e.target.value)}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500"
              >
                <option value="">Sélectionner un véhicule</option>
                {Array.isArray(automobiles) && automobiles.map((auto) => (
                  <option key={auto.id} value={auto.id}>
                    {auto.nom} ({auto.matriculation})
                  </option>
                ))}
              </select>
            </div>

            {/* Livraison */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Frais de Livraison *</label>
              <select
                value={livraison}
                required
                onChange={(e) => setLivraison(e.target.value)}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500"
              >
                <option value="">Sélectionner un montant</option>
                {[1000, 1500, 2000, 3000, 4000, 5000].map((amount) => (
                  <option key={amount} value={amount}>
                    {amount.toLocaleString()} FCFA
                  </option>
                ))}
              </select>
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Lieu de livraison *</label>
              <input
                type="text"
                className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Sacré-Cœur 3"
                value={adresse}
                required
                onChange={(e) => setAdresse(e.target.value)}
              />
            </div>
          </div>

          {/* Panier */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-green-700 mb-4">🛒 Panier ({panier.length} articles)</h2>

              {panier.length === 0 ? (
                <p className="text-gray-500">Votre panier est vide.</p>
              ) : (
                <div className="space-y-3">
                  {panier.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm border-b pb-2">
                      <span>{item.Nom} × {item.quantite}</span>
                      <span className="font-semibold">{(item.prixVente * item.quantite).toLocaleString()} FCFA</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 border-t pt-4">
              <p className="text-right font-bold text-lg">
                Total Produits : {totalProduits.toLocaleString()} FCFA
              </p>
              <p className="text-right font-bold text-lg">
                Livraison : {fraisLivraison.toLocaleString()} FCFA
              </p>
              <p className="text-right text-green-700 text-2xl font-extrabold mt-2">
                Total : {totalFinal.toLocaleString()} FCFA
              </p>

              <button
                className="w-full bg-green-600 text-white py-3 mt-6 rounded-lg hover:bg-green-700 transition font-bold text-lg"
                onClick={handleCommande}
              >
                ✅ Confirmer la commande
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}