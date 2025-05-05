import { useState } from "react";
import { useRouter } from "next/router";
import Master from "@/components/Master";

export default function AjouterAutomobile() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [matriculation, setMatriculation] = useState("");
  const [etat, setEtat] = useState("disponible");
  const [type, setType] = useState("moto");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const etats = ["disponible","indisponible", "en_maintenance"];
  const types = ["voiture", "moto"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/automobiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, matriculation, etat, type }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors de l'ajout de l'automobile");
      }
      
      router.push("/automobiles/list");
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Master>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Ajouter un moyen de livraison</h2>
            <p className="mt-2 text-sm text-gray-600">
              Remplissez les informations de l automobile à ajouter
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
            <form className="mb-0 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                  Nom du véhicule
                </label>
                <div className="mt-1">
                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Peugeot 308"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="matriculation" className="block text-sm font-medium text-gray-700">
                  Numéro de matriculation
                </label>
                <div className="mt-1">
                  <input
                    id="matriculation"
                    name="matriculation"
                    type="text"
                    required
                    value={matriculation}
                    onChange={(e) => setMatriculation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="AB-123-CD"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="etat" className="block text-sm font-medium text-gray-700">
                  État du véhicule
                </label>
                <div className="mt-1">
                  <select
                    id="etat"
                    name="etat"
                    required
                    value={etat}
                    onChange={(e) => setEtat(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {etats.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Type de véhicule
                </label>
                <div className="mt-1">
                  <select
                    id="type"
                    name="type"
                    required
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {types.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Enregistrer
                    </>
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