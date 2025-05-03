import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Master from '@/components/Master';
import { Plus, AlertCircle, Check, Loader } from 'lucide-react';

export default function AjouterAgence() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    ville_id: ''
  });
  
  const [villes, setVilles] = useState([]);
  // const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    const fetchVilles = async () => {
      try {
        const res = await axios.get('/api/villes');
        setVilles(res.data);
        setError(null);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger la liste des villes');
      } finally {
        // setIsLoading(false);
      }
    };
    
    fetchVilles();

    return () => setIsMounted(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isMounted || isSubmitting) return;
    
    setError(null);
    setIsSubmitting(true);

    try {
      
      const response = await axios.post('/api/agences', {
        nom: formData.nom.trim(),
        adresse: formData.adresse.trim(),
        ville_id: formData.ville_id
      });

      if(!response) return;

      if (isMounted) {
        setSuccess('Agence ajoutée avec succès');
        setTimeout(() => router.push('/agences/list'), 1500);
      }
    } catch (err) {
      if (isMounted) {
        console.error('Erreur:', err.response?.data || err.message);
        setError(err.response?.data?.message || "Erreur lors de l'ajout de l'agence");
      }
    } finally {
      if (isMounted) {
        setIsSubmitting(false);
      }
    }
  };

  if (!isMounted) {
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

          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Ajouter une agence</h2>
            <p className="mt-2 text-sm text-gray-600">
              Renseignez les informations de la nouvelle agence
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-3 text-red-500" />
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 rounded-md">
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-3 text-green-500" />
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          )}

          <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l agence *
                </label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  required
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <textarea
                  id="adresse"
                  name="adresse"
                  rows={3}
                  value={formData.adresse}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="ville_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Ville *
                </label>
                  <select
                    id="ville_id"
                    name="ville_id"
                    required
                    value={formData.ville_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    disabled={isSubmitting}
                  >
                    <option value="">Sélectionnez une ville</option>
                    {villes.map((ville) => (
                      <option key={ville.id} value={ville.id}>
                        {ville.nom} {ville.pays_nom && `(${ville.pays_nom})`}
                      </option>
                    ))}
                  </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Master>
  );
}