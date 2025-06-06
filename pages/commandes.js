import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/auth/meValidation');
        const data = await res.json();
        if (!data.valid) {
          router.push('/code-verification');
        }
      } catch (err) {
        console.error("Erreur lors de la vérification du code :", err);
      }
    }, 30000);
    return () => clearInterval(interval);
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

  const totalProduits = panier.reduce((acc, item) => {
    const quantite = parseInt(item.quantite, 10) || 0;
    const prix = parseInt(item.prixVente) || 0;
    return acc + quantite * prix;
  }, 0);
  const fraisLivraison = parseInt(livraison) || 0;
  const totalFinal = totalProduits + fraisLivraison;

  const handleCommande = async () => {
    if (!nomPatient || fraisLivraison < 0 || panier.length === 0) {
      setMessage('❗ Veuillez remplir tous les champs correctement.');
      return;
    }
    try {
      const res = await fetch('/api/commande', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomPatient,
          telephone,
          livraison: fraisLivraison,
          adresse,
          panier,
          total: totalFinal,
          userId: user.id,
          automobileId: selectedAutomobileId,
          chauffeurId: selectedChauffeurId
        })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.removeItem('panier');
        setMessage('✅ Commande enregistrée avec succès !');
        setTimeout(() => {
          router.push('/accueil');
        }, 2000);
      } else {
        setMessage(data.error || '❌ Une erreur est survenue.');
      }
    } catch (error) {
      console.error('Erreur API :', error);
      setMessage('❌ Une erreur réseau est survenue.');
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
          {/* Formulaire */}
          <div className="bg-white p-6 rounded-lg shadow-md space-y-5">
            <input type="text" placeholder="Nom du patient" className="w-full border p-2 rounded" value={nomPatient} onChange={(e) => setNomPatient(e.target.value)} required />
            <input type="text" placeholder="Téléphone" className="w-full border p-2 rounded" value={telephone} onChange={(e) => setTelephone(e.target.value)} required />
            <select className="w-full border p-2 rounded" value={selectedChauffeurId} onChange={(e) => setSelectedChauffeurId(e.target.value)} required>
              <option value="">Sélectionner un livreur</option>
              {chauffeurs.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
            </select>
            <select className="w-full border p-2 rounded" value={selectedAutomobileId} onChange={(e) => setSelectedAutomobileId(e.target.value)} required>
              <option value="">Sélectionner un véhicule</option>
              {automobiles.map(a => <option key={a.id} value={a.id}>{a.nom} ({a.matriculation})</option>)}
            </select>
            <select className="w-full border p-2 rounded" value={livraison} onChange={(e) => setLivraison(e.target.value)} required>
              <option value="">Sélectionner un montant</option>
              {[1000,1500,2000,3000,4000,5000].map(amount => (
                <option key={amount} value={amount}>{amount.toLocaleString()} FCFA</option>
              ))}
            </select>
            <input type="text" placeholder="Adresse de livraison" className="w-full border p-2 rounded" value={adresse} onChange={(e) => setAdresse(e.target.value)} required />
          </div>

          {/* Panier */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-green-700 mb-4">🛒 Panier ({panier.length} articles)</h2>
            {panier.length === 0 ? <p className="text-gray-500">Votre panier est vide.</p> : (
              <div className="space-y-3">
                {panier.map(item => (
                  <div key={item.id} className="flex justify-between text-sm border-b pb-2">
                    <span>{item.Nom} × {item.quantite}</span>
                    <span>{item.prixVente} FCFA</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 text-right font-semibold text-lg">
              Total : {totalFinal.toLocaleString()} FCFA
            </div>
            <button onClick={handleCommande} className="mt-6 w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 transition">
              ✅ Valider la commande
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}