import { useEffect, useState } from "react";
import Master from "@/components/Master";

export default function TransactionsPage() {
  const [consultations, setConsultations] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [totalConsultations, setTotalConsultations] = useState(0);
  const [totalCommandes, setTotalCommandes] = useState(0);
  const [agences, setAgences] = useState([]);
  const [selectedAgence, setSelectedAgence] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgences();
    fetchTransactions();
  }, []);

  const fetchAgences = async () => {
    try {
      const res = await fetch("/api/agences");
      const data = await res.json();
      setAgences(data);
    } catch (err) {
      console.error("Erreur chargement agences :", err);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (selectedAgence) query.append("agence_id", selectedAgence);
      if (dateDebut) query.append("date_debut", dateDebut);
      if (dateFin) query.append("date_fin", dateFin);

      const res = await fetch(`/api/transactions?${query.toString()}`);
      const data = await res.json();

      setConsultations(data.consultations || []);
      setCommandes(data.commandes || []);
      setTotalConsultations(data.totalConsultation || 0);
      setTotalCommandes(data.totalCommande || 0);
    } catch (err) {
      console.error("Erreur chargement transactions :", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrer = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  return (
    <Master>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Historique des Transactions</h1>

        {/* FILTRES */}
        <form onSubmit={handleFiltrer} className="flex flex-wrap gap-4 mb-8 items-end">
          <div>
            <label className="block mb-1 text-sm font-medium">Agence</label>
            <select
              value={selectedAgence}
              onChange={(e) => setSelectedAgence(e.target.value)}
              className="border px-3 py-2 rounded w-48"
            >
              <option value="">Toutes</option>
              {agences.map(a => (
                <option key={a.id} value={a.id}>{a.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Date début</label>
            <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Date fin</label>
            <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="border px-3 py-2 rounded" />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Filtrer
          </button>
        </form>

        {loading ? (
          <div className="text-center py-20">Chargement en cours...</div>
        ) : (
          <>
            {/* TABLE CONSULTATIONS */}
            <div className="lg:flex lg:space-x-9">
            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-green-600 mb-2">Consultations</h2>
              <p className="mb-4">Total : <strong>{totalConsultations.toLocaleString("fr-FR")} FCFA</strong></p>
              <TransactionTable data={consultations} color="green" />
            </div>

            {/* TABLE COMMANDES */}
            <div className="float-right">
              <h2 className="text-2xl font-semibold text-blue-600 mb-2">Commandes</h2>
              <p className="mb-4">Total : <strong>{totalCommandes.toLocaleString("fr-FR")} FCFA</strong></p>
              <TransactionTable data={commandes} color="blue" />
            </div>
            </div>
          </>
        )}
      </div>
    </Master>
  );
}

function TransactionTable({ data, color }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow rounded-lg">
        <thead className={`bg-${color}-100 text-${color}-800`}>
          <tr>
            <th className="py-2 px-4">Date</th>
            <th className="py-2 px-4">Montant</th>
            <th className="py-2 px-4">Mode Paiement</th>
          </tr>
        </thead>
        <tbody>
          {data.map(tx => (
            <tr key={tx.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4">{new Date(tx.date_transaction).toLocaleDateString()}</td>
              <td className="py-2 px-4 text-right">{tx.montant.toLocaleString("fr-FR")} FCFA</td>
              <td className="py-2 px-4">{tx.mode_paiement}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}