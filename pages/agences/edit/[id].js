import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Master from '@/components/Master';
import { Edit, AlertCircle, Check, Loader, ArrowLeft } from 'lucide-react';

export default function ModifierAgence() {
  const router = useRouter();
  const { id } = router.query;
  
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    ville_id: ''
  });
  const [villes, setVilles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [agenceRes, villesRes] = await Promise.all([
          axios.get(`/api/agences/${id}`),
          axios.get('/api/villes')
        ]);

        setFormData({
          nom: agenceRes.data.nom,
          adresse: agenceRes.data.adresse || '',
          ville_id: agenceRes.data.ville_id.toString()
        });
        setVilles(villesRes.data);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les données');
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
    setError(null);
    setIsLoading(true);
    
    try {
      const payload = {
        nom: formData.nom,
        adresse: formData.adresse,
        ville_id: parseInt(formData.ville_id)
      };

      const response = await axios.put(`/api/agences/${id}`, payload);
      setSuccess('Agence modifiée avec succès');
      setTimeout(() => router.push('/agences/list'), 1500);
    } catch (err) {
      console.error('Erreur:', err.response?.data || err.message);
      
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'Données invalides');
      } else if (err.response?.status === 404) {
        setError('Agence non trouvée');
      } else {
        setError('Erreur serveur - Veuillez réessayer');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Master>
        <div className="flex justify-center items-center h-screen">
          <Loader className="animate-spin h-8 w-8 text-green-600" />
        </div>
      </Master>
    );
  }

  return (
    <Master>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => router.push('/agences/list')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Retour
          </button>

          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Edit className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Modifier l'agence</h2>
            <p className="mt-2 text-sm text-gray-600">
              Mise à jour des informations de l'agence
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">{success}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
            <form className="mb-0 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                  Nom de l'agence *
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
                <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">
                  Adresse
                </label>
                <div className="mt-1">
                  <textarea
                    id="adresse"
                    name="adresse"
                    rows={3}
                    value={formData.adresse}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ville_id" className="block text-sm font-medium text-gray-700">
                  Ville *
                </label>
                <div className="mt-1">
                  <select
                    id="ville_id"
                    name="ville_id"
                    required
                    value={formData.ville_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Sélectionnez une ville</option>
                    {villes.map((ville) => (
                      <option key={ville.id} value={ville.id}>
                        {ville.nom} ({ville.pays_nom})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
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
    </Master>
  );
}