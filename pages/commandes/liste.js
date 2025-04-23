import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import Layout from '../../components/Layout';

export default function CommandesPage() {
  const [commandes, setCommandes] = useState([]);
  const [detailsVisible, setDetailsVisible] = useState({});
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [montantTotal, setMontantTotal] = useState(0);

  const fetchCommandes = async () => {
    try {
      const response = await axios.get(`/api/commandes/liste?dateDebut=${dateDebut}&dateFin=${dateFin}`);
      setCommandes(response.data.commandes);
      setMontantTotal(response.data.total);
    } catch (err) {
      console.error('Erreur fetch commandes :', err);
    }
  };

  useEffect(() => {
    fetchCommandes();
  }, [dateDebut, dateFin]);

  const toggleDetails = (id) => {
    setDetailsVisible((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-green-600">📋 Liste des Commandes</h1>

      {/* Filtres par dates */}
      <div className="flex gap-4 mb-6">
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
          className="border rounded px-4 py-2"
        />
        <input
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
          className="border rounded px-4 py-2"
        />
      </div>

      {/* Liste des commandes */}
      <div className="space-y-4">
        {commandes.map((cmd) => (
          <div key={cmd.id} className="border rounded-xl shadow-sm p-4 bg-white">
            <div className="flex justify-between items-center">
              <div>
                <p><span className="font-semibold">🧍 Patient :</span> {cmd.client_nom}</p>
                <p><span className="font-semibold">📅 Date :</span> {format(new Date(cmd.date_commande), 'dd/MM/yyyy HH:mm')}</p>
                <p><span className="font-semibold">💰 Total :</span> {cmd.total} FCFA</p>
                <p><span className="font-semibold">🚚 Livraison :</span> {cmd.livraison} FCFA</p>
                <p><span className="font-semibold">📍 Adresse :</span> {cmd.adresse}</p>
              </div>
              <div className="text-right">
                <p className={`px-3 py-1 rounded-full text-sm font-medium 
                  ${cmd.statut === 'en cours' ? 'bg-yellow-200 text-yellow-700' :
                    cmd.statut === 'livré' ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}>
                  {cmd.statut.toUpperCase()}
                </p>
                <button
                  onClick={() => toggleDetails(cmd.id)}
                  className="mt-2 text-sm text-blue-500 underline"
                >
                  {detailsVisible[cmd.id] ? 'Masquer détails' : 'Voir détails'}
                </button>
              </div>
            </div>

            {/* Détails des produits */}
            {detailsVisible[cmd.id] && cmd.details && (
              <div className="mt-4 border-t pt-2">
                <p className="font-semibold mb-1">📦 Produits :</p>
                <ul className="ml-4 list-disc">
                  {cmd.details.map((item, index) => (
                    <li key={index}>
                      {item.nom} - {item.quantite} × {item.prix} FCFA = {item.quantite * item.prix} FCFA
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Montant total */}
      <div className="mt-8 text-right text-xl font-bold text-green-900">
        💵 Total des commandes : {montantTotal} FCFA
      </div>
    </div>
    </Layout>
  );
}