import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import Master from "@/components/Master";
import { Edit, Trash2, UserPlus, Loader, User, AlertCircle } from "lucide-react";

export default function ListeUtilisateurs() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isDeleting, setIsDeleting] = useState(null);

  // Récupère la liste des utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/users");
      setUsers(res.data); // Mise à jour de la liste des utilisateurs
    } catch (err) {
      console.error(err);
      setMessage({ text: "Erreur lors du chargement des utilisateurs", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un utilisateur
  const deleteUser = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;

    try {
      setIsDeleting(id); // Marquer l'utilisateur comme étant en train d'être supprimé
      await axios.delete(`/api/users/${id}`);
      setMessage({ text: "Utilisateur supprimé avec succès", type: "success" });
      fetchUsers(); // Recharger la liste des utilisateurs après suppression
    } catch (err) {
      console.error(err);
      setMessage({ 
        text: err.response?.data?.message || "Erreur lors de la suppression de l'utilisateur", 
        type: "error" 
      });
    } finally {
      setIsDeleting(null); // Réinitialiser l'état de suppression
    }
  };

  // Retourner le badge du rôle utilisateur
  const getRoleBadge = (role) => {
    const colors = {
      admin: "bg-blue-100 text-blue-800",
      super: "bg-purple-100 text-purple-800",
      simple: "bg-gray-100 text-gray-800"
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[role] || colors.simple}`}>
        {role === 'admin' ? 'Administrateur' : 
         role === 'super' ? 'Super Admin' : 'Utilisateur'}
      </span>
    );
  };

  // Effet au montage pour récupérer les utilisateurs
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Master>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <User className="mr-2 h-6 w-6" />
              Liste des utilisateurs
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestion des comptes utilisateurs
            </p>
          </div>
          <div>
            <Link
              href="/users/add"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <UserPlus className="-ml-1 mr-2 h-5 w-5" />
              Ajouter un utilisateur
            </Link>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === "error" ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"
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
        ) : users.length === 0 ? (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6 text-center">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun utilisateur</h3>
              <p className="mt-1 text-sm text-gray-500">Commencez par ajouter un nouvel utilisateur</p>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{user.prenom} {user.nom}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.telephone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <Link
                          href={`/users/edit/${user.id}`}
                          className="inline-flex items-center text-green-600 hover:text-green-900"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Link>
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={isDeleting === user.id}
                          className={`inline-flex items-center text-red-600 hover:text-red-900 ${
                            isDeleting === user.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isDeleting === user.id ? (
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