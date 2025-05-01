import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function ModifierVille() {
  const router = useRouter();
  const { id } = router.query;
  
  const [formData, setFormData] = useState({
    id: '',
    nom: '',
    pays_id: ''
  });
  const [pays, setPays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Chargement initial des données
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [villeResponse, paysResponse] = await Promise.all([
          axios.get(`/api/villes/${id}`),
          axios.get('/api/pays')
        ]);

        setFormData({
          id: villeResponse.data.id,
          nom: villeResponse.data.nom,
          pays_id: villeResponse.data.pays_id.toString() // Conversion en string pour le select
        });
        setPays(paysResponse.data);
      } catch (error) {
        console.error('Erreur:', error);
        setApiError('Impossible de charger les données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setIsLoading(true);
    
    try {
      // Préparation des données selon les exigences de votre API
      const payload = {
        id: formData.id,
        nom: formData.nom,
        pays_id: parseInt(formData.pays_id) // Conversion en number
      };

      const response = await axios.put(`/api/villes/${id}`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setSuccess(response.data.message || 'Ville mise à jour avec succès');
      setTimeout(() => router.push('/villes/list'), 1500);
    } catch (error) {
      console.error('Erreur détaillée:', error.response?.data || error.message);
      
      // Gestion précise des erreurs basée sur votre API
      if (error.response?.status === 400) {
        setApiError(error.response.data.message || 'Données invalides');
      } else if (error.response?.status === 404) {
        setApiError('Ville non trouvée');
      } else {
        setApiError('Erreur serveur - Veuillez réessayer');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <svg className="mx-auto h-12 w-12 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Modifier la ville</h2>
          <p className="mt-2 text-sm text-gray-600">
            Mise à jour des informations de {formData.nom}
          </p>
        </div>

        {/* Affichage des erreurs API */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{apiError}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Message de succès */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">{success}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire */}
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <form className="mb-0 space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="id" value={formData.id} />
            
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                Nom de la ville
              </label>
              <div className="mt-1">
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  required
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="pays_id" className="block text-sm font-medium text-gray-700">
                Pays
              </label>
              <div className="mt-1">
                <select
                  id="pays_id"
                  name="pays_id"
                  required
                  value={formData.pays_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Sélectionnez un pays</option>
                  {pays.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => router.push('/villes/list')}
                className="flex-1 justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enregistrement...
                  </>
                ) : (
                  'Mettre à jour'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}