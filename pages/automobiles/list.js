import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Master from "@/components/Master";
import { Edit, Trash2, Plus, Loader, AlertCircle, Car } from "lucide-react";

export default function ListeAutomobiles() {
  const [automobiles, setAutomobiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    fetchAutomobiles();
  }, []);

  const fetchAutomobiles = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/automobiles");
      setAutomobiles(res.data);
      setMessage({ text: "", type: "" });
    } catch (err) {
      console.error(err);
      setMessage({ 
        text: "Erreur lors du chargement des automobiles", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const supprimerAutomobile = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer cette automobile ?")) return;

    try {
      setIsDeleting(id);
      await axios.delete(`/api/automobiles/${id}`);
      setMessage({ 
        text: "Automobile supprimée avec succès", 
        type: "success" 
      });
      fetchAutomobiles();
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
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Car className="mr-2 h-6 w-6" />
              Liste des automobiles
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestion des moyens de livraison disponibles dans le système
            </p>
          </div>
          <div>
            <Link
              href="/automobiles/add"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Ajouter un moyen de livraison
            </Link>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === "error" 
              ? "bg-red-50 text-red-800" 
              : "bg-blue-50 text-blue-800"
          }`}>
            <div className="flex items-center">
              {message.type === "error" ? (
                <AlertCircle className="h-5 w-5 mr-3 text-red-500" />
              ) : (
                <svg className="h-5 w-5 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin h-8 w-8 text-blue-600" />
          </div>
        ) : automobiles.length === 0 ? (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6 text-center">
              <Car className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune automobile trouvée</h3>
              <p className="mt-1 text-sm text-gray-500">Commencez par ajouter une nouvelle automobile.</p>
              <div className="mt-6">
                <Link
                  href="/automobiles/add"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Ajouter une automobile
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
                      Nom
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Matriculation
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      État
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {automobiles.map((auto) => (
                    <tr key={auto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {auto.nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {auto.matriculation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          auto.etat === 'Neuf' ? 'bg-green-100 text-green-800' :
                          auto.etat === 'Occasion' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {auto.etat}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {auto.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <Link
                          href={`/automobiles/edit/${auto.id}`}
                          className="inline-flex items-center text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Link>
                        <button
                          onClick={() => supprimerAutomobile(auto.id)}
                          disabled={isDeleting === auto.id}
                          className={`inline-flex items-center text-red-600 hover:text-red-900 ${
                            isDeleting === auto.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isDeleting === auto.id ? (
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