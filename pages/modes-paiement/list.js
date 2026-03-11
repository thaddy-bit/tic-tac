import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Master from "@/components/Master";
import { Edit, Trash2, Plus, Loader, AlertCircle, CreditCard } from "lucide-react";

const TYPE_LABELS = { code: "Code", mobile_money: "Mobile Money", autre: "Autre" };

export default function ListeModesPaiement() {
  const [modes, setModes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    fetchModes();
  }, []);

  const fetchModes = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/modes-paiement");
      setModes(res.data);
      setMessage({ text: "", type: "" });
    } catch (err) {
      console.error(err);
      setMessage({ text: "Erreur lors du chargement des modes de paiement", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const supprimer = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer ce mode de paiement ?")) return;
    try {
      setIsDeleting(id);
      await axios.delete(`/api/modes-paiement/${id}`);
      setMessage({ text: "Mode de paiement supprimé avec succès", type: "success" });
      fetchModes();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Erreur lors de la suppression",
        type: "error",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <Master>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <CreditCard className="mr-2 h-6 w-6" />
              Modes de paiement
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestion des moyens de paiement (Code, MTN Money, Airtel Money, etc.)
            </p>
          </div>
          <div>
            <Link
              href="/modes-paiement/add"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Ajouter un mode
            </Link>
          </div>
        </div>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.type === "error" ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"
            }`}
          >
            <div className="flex items-center">
              {message.type === "error" ? (
                <AlertCircle className="h-5 w-5 mr-3 text-red-500" />
              ) : (
                <svg className="h-5 w-5 mr-3 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin h-8 w-8 text-green-600" />
          </div>
        ) : modes.length === 0 ? (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6 text-center">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun mode de paiement</h3>
              <p className="mt-1 text-sm text-gray-500">Ajoutez Code, MTN Money, Airtel Money, etc.</p>
              <div className="mt-6">
                <Link
                  href="/modes-paiement/add"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Ajouter un mode
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordre</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">État</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {modes.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{m.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.nom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{m.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{TYPE_LABELS[m.type] || m.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.ordre}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${m.actif ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                          {m.actif ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <Link href={`/modes-paiement/edit/${m.id}`} className="inline-flex items-center text-green-600 hover:text-green-900">
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Link>
                        <button
                          onClick={() => supprimer(m.id)}
                          disabled={isDeleting === m.id}
                          className={`inline-flex items-center text-red-600 hover:text-red-900 ${isDeleting === m.id ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <span className="inline-flex items-center">
                            {isDeleting === m.id ? <Loader className="animate-spin h-4 w-4 mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
                            {isDeleting === m.id ? "Suppression..." : "Supprimer"}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Master>
  );
}
