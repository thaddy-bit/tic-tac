import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Master from "@/components/Master";
import { Edit, Trash2, Plus, Loader, AlertCircle } from "lucide-react";

export default function ListePays() {
  const [pays, setPays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    fetchPays();
  }, []);

  const fetchPays = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/pays");
      setPays(res.data);
      setMessage({ text: "", type: "" });
    } catch (err) {
      console.error(err);
      setMessage({ 
        text: "Erreur lors du chargement des pays", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const supprimerPays = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer ce pays ?")) return;

    try {
      setIsDeleting(id);
      await axios.delete(`/api/pays/${id}`);
      setMessage({ 
        text: "Pays supprimé avec succès", 
        type: "success" 
      });
      fetchPays();
    } catch (err) {
      console.error(err);
      setMessage({ 
        text: err.response?.data?.message || "Erreur lors de la suppression", 
        type: "error" 
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
            <h1 className="text-2xl font-bold text-gray-900">Liste des pays</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestion des pays disponibles dans le système
            </p>
          </div>
          <div>
            <Link
              href="/pays/add"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Ajouter un pays
            </Link>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === "error" 
              ? "bg-red-50 text-red-800" 
              : "bg-green-50 text-green-800"
          }`}>
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
        ) : pays.length === 0 ? (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun pays trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">Commencez par ajouter un nouveau pays.</p>
              <div className="mt-6">
                <Link
                  href="/pays/add"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Ajouter un pays
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pays.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {p.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {p.nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <Link
                          href={`/pays/edit/${p.id}`}
                          className="inline-flex items-center text-green-600 hover:text-green-900"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Link>
                        <button
                          onClick={() => supprimerPays(p.id)}
                          disabled={isDeleting === p.id}
                          className={`inline-flex items-center text-red-600 hover:text-red-900 ${
                            isDeleting === p.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isDeleting === p.id ? (
                            <Loader className="animate-spin h-4 w-4 mr-1" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-1" />
                          )}
                          Supprimer
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