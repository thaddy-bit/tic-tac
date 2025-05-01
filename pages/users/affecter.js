import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Master from "@/components/Master";
import { User, Building2, Check, X, Loader } from "lucide-react";

export default function AffectationUtilisateurs() {
  const [users, setUsers] = useState([]);
  const [agences, setAgences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAgence, setSelectedAgence] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, agencesRes] = await Promise.all([
        axios.get("/api/users?includeAgence=true"),
        axios.get("/api/agences")
      ]);
      
      // Adaptez le formatage selon la structure réelle de votre base
    const formattedUsers = usersRes.data.map(user => ({
        ...user,
        agence: user.agence_id ? {
          id: user.agence_id,
          nom: user.agence_nom,
          ville: user.agence_ville // Utilisez le bon nom de champ ici
        } : null
      }));
      
      setUsers(formattedUsers);
      setAgences(agencesRes.data);
      setMessage({ text: "", type: "" });
    } catch (err) {
      console.error(err);
      setMessage({ 
        text: "Erreur lors du chargement des données", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAffectation = async () => {
    if (!selectedUser || !selectedAgence) {
      setMessage({ 
        text: "Veuillez sélectionner un utilisateur et une agence", 
        type: "error" 
      });
      return;
    }

    try {
      setMessage({ text: "Traitement en cours...", type: "info" });
      
      // Envoi de la requête PUT avec les données formatées
      await axios.put(`/api/users/${selectedUser}`, {
        agence_id: selectedAgence
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setMessage({ 
        text: "Affectation réussie", 
        type: "success" 
      });
      
      // Rechargement des données après modification
      await fetchData();
      setSelectedUser(null);
      setSelectedAgence("");
    } catch (err) {
      console.error("Erreur détaillée:", err.response?.data || err.message);
      setMessage({ 
        text: err.response?.data?.message || "Erreur lors de l'affectation", 
        type: "error" 
      });
    }
  };

  const handleRemoveAffectation = async () => {
    if (!selectedUser) {
      setMessage({ 
        text: "Veuillez sélectionner un utilisateur", 
        type: "error" 
      });
      return;
    }

    try {
      setMessage({ text: "Traitement en cours...", type: "info" });
      
      await axios.put(`/api/users/${selectedUser}`, {
        agence_id: null
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setMessage({ 
        text: "Affectation supprimée", 
        type: "success" 
      });
      
      await fetchData();
      setSelectedUser(null);
      setSelectedAgence("");
    } catch (err) {
      console.error("Erreur détaillée:", err.response?.data || err.message);
      setMessage({ 
        text: err.response?.data?.message || "Erreur lors de la suppression", 
        type: "error" 
      });
    }
  };

  // Rendu du composant (identique à votre version originale)
  return (
    <Master>
      {/* ... (le reste de votre code JSX reste inchangé) ... */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <User className="mr-2 h-6 w-6" />
              Affectation utilisateurs/agences
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Sélectionnez un utilisateur et une agence pour les affecter
            </p>
          </div>
        </div>

        {/* Message d'état */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === "error" ? "bg-red-50 text-red-800" :
            message.type === "success" ? "bg-green-50 text-green-800" :
            "bg-blue-50 text-blue-800"
          }`}>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Sélection utilisateur */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <User className="mr-2 h-5 w-5" />
              Sélectionner un utilisateur
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <div 
                  key={user.id}
                  onClick={() => setSelectedUser(user.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedUser === user.id 
                      ? "border-green-500 bg-green-50" 
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium">
                    {user.prenom} {user.nom}
                  </div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  {user.agence && (
                    <div className="text-sm mt-1">
                      <span className="text-gray-500">Actuellement affecté à : </span>
                      <span className="font-medium">
                        {user.agence.nom} ({user.agence.ville_nom})
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sélection agence */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Building2 className="mr-2 h-5 w-5" />
              Sélectionner une agence
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {agences.map((agence) => (
                <div 
                  key={agence.id}
                  onClick={() => setSelectedAgence(agence.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAgence === agence.id 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium">{agence.nom}</div>
                  <div className="text-sm text-gray-600">{agence.adresse}</div>
                  <div className="text-sm text-gray-500">{agence.ville_nom}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleRemoveAffectation}
            disabled={!selectedUser}
            className={`px-4 py-2 rounded-md flex items-center ${
              !selectedUser 
                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            <X className="mr-2 h-4 w-4" />
            Retirer l'affectation
          </button>
          <button
            onClick={handleAffectation}
            disabled={!selectedUser || !selectedAgence}
            className={`px-4 py-2 rounded-md flex items-center ${
              !selectedUser || !selectedAgence
                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            <Check className="mr-2 h-4 w-4" />
            Valider l'affectation
          </button>
        </div>

        {/* Utilisateur sélectionné */}
        {selectedUser && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4">Détails de l'affectation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Utilisateur sélectionné :</h3>
                <p className="text-gray-900">
                  {users.find(u => u.id === selectedUser)?.prenom} {users.find(u => u.id === selectedUser)?.nom}
                </p>
                <p className="text-sm text-gray-600">
                  {users.find(u => u.id === selectedUser)?.email}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Agence sélectionnée :</h3>
                {selectedAgence ? (
                  <>
                    <p className="text-gray-900">
                      {agences.find(a => a.id === selectedAgence)?.nom}
                    </p>
                    <p className="text-sm text-gray-600">
                      {agences.find(a => a.id === selectedAgence)?.ville_nom}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">Aucune agence sélectionnée</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Master>
  );
}