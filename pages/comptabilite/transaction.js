import { useEffect, useState } from "react";
import Master from "@/components/Master";
import { FiFilter, FiRefreshCw, FiTrendingUp, FiShoppingCart, FiCalendar, FiCreditCard } from "react-icons/fi";

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
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'consultations', 'commandes'

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

  const handleReset = () => {
    setSelectedAgence("");
    setDateDebut("");
    setDateFin("");
    setActiveTab("all");
    fetchTransactions();
  };

  return (
    <Master>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Historique des Transactions</h1>
            <p className="text-gray-600 mt-2">Suivez toutes les activités financières de votre entreprise</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition"
            >
              <FiRefreshCw size={16} />
              Réinitialiser
            </button>
          </div>
        </div>

        {/* FILTRES */}
        <form onSubmit={handleFiltrer} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-1">
                <FiFilter size={14} />
                Agence
              </label>
              <select
                value={selectedAgence}
                onChange={(e) => setSelectedAgence(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Toutes les agences</option>
                {agences.map(a => (
                  <option key={a.id} value={a.id}>{a.nom}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-1">
                <FiCalendar size={14} />
                Date début
              </label>
              <input 
                type="date" 
                value={dateDebut} 
                onChange={(e) => setDateDebut(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-1">
                <FiCalendar size={14} />
                Date fin
              </label>
              <input 
                type="date" 
                value={dateFin} 
                onChange={(e) => setDateFin(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            
            <div className="self-end">
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition"
              >
                <FiFilter size={16} />
                Appliquer
              </button>
            </div>
          </div>
        </form>

        {/* CARTES DE RÉSUMÉ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard 
            title="Total Transactions" 
            value={(totalConsultations + totalCommandes).toLocaleString("fr-FR") + " FCFA"} 
            icon={<FiTrendingUp size={24} />}
            color="blue"
          />
          <SummaryCard 
            title="Consultations" 
            value={totalConsultations.toLocaleString("fr-FR") + " FCFA"} 
            icon={<FiTrendingUp size={24} />}
            color="green"
            count={consultations.length}
          />
          <SummaryCard 
            title="Commandes" 
            value={totalCommandes.toLocaleString("fr-FR") + " FCFA"} 
            icon={<FiShoppingCart size={24} />}
            color="purple"
            count={commandes.length}
          />
          <SummaryCard 
            title="Transactions" 
            value={(consultations.length + commandes.length).toString()} 
            icon={<FiCreditCard size={24} />}
            color="orange"
          />
        </div>

        {/* ONGLETS */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition ${
              activeTab === "all" 
                ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("all")}
          >
            Toutes les transactions
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition ${
              activeTab === "consultations" 
                ? "bg-green-50 text-green-700 border-b-2 border-green-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("consultations")}
          >
            Consultations
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition ${
              activeTab === "commandes" 
                ? "bg-purple-50 text-purple-700 border-b-2 border-purple-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("commandes")}
          >
            Commandes
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {(activeTab === "all" || activeTab === "consultations") && (
              <div className={`mb-10 ${activeTab === "consultations" ? "" : "border-b pb-8"}`}>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <FiTrendingUp className="text-green-600" size={18} />
                  </div>
                  Consultations
                </h2>
                <TransactionTable 
                  data={consultations} 
                  color="green" 
                  emptyMessage="Aucune consultation trouvée"
                />
              </div>
            )}

            {(activeTab === "all" || activeTab === "commandes") && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <FiShoppingCart className="text-purple-600" size={18} />
                  </div>
                  Commandes
                </h2>
                <TransactionTable 
                  data={commandes} 
                  color="purple" 
                  emptyMessage="Aucune commande trouvée"
                />
              </div>
            )}
          </>
        )}
      </div>
    </Master>
  );
}

function SummaryCard({ title, value, icon, color, count }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
    orange: "bg-orange-50 text-orange-700"
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition hover:shadow-md`}>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
        {count !== undefined && (
          <div className="mt-3 text-sm text-gray-500">
            {count} transaction{count !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}

function TransactionTable({ data, color, emptyMessage }) {
  const colorClasses = {
    green: {
      header: "bg-green-50 text-green-700",
      row: "hover:bg-green-50",
      amount: "text-green-700"
    },
    purple: {
      header: "bg-purple-50 text-purple-700",
      row: "hover:bg-purple-50",
      amount: "text-purple-700"
    }
  };

  const currentColor = colorClasses[color] || colorClasses.green;

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="max-w-xs mx-auto">
          <div className="bg-gray-100 rounded-full p-4 inline-block">
            <FiCreditCard className="text-gray-400 mx-auto" size={36} />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune donnée disponible</h3>
          <p className="mt-1 text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className={`${currentColor.header}`}>
              <th className="py-4 px-6 text-left font-semibold">Date</th>
              <th className="py-4 px-6 text-left font-semibold">Détails</th>
              <th className="py-4 px-6 text-right font-semibold">Montant</th>
              <th className="py-4 px-6 text-left font-semibold">Mode de paiement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map(tx => (
              <tr key={tx.id} className={`${currentColor.row} transition`}>
                <td className="py-4 px-6">
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(tx.date_transaction).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(tx.date_transaction).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="text-sm font-medium text-gray-900">
                    {tx.client_nom || "Transaction système"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {tx.reference || "N/A"}
                  </div>
                </td>
                <td className="py-4 px-6 text-right font-medium">
                  <span className={`${currentColor.amount}`}>
                    {tx.montant.toLocaleString("fr-FR")} FCFA
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    {tx.mode_paiement}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}