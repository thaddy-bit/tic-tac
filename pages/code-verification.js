import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { useRouter } from 'next/router';

export default function CodeValidationPage() {
  const [code, setCode] = useState('');
  const [montant, setMontant] = useState('');
  const [typeTransaction, setTypeTransaction] = useState('Consultation');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("Utilisateur non connecté");
        const data = await res.json();
        setUser(data);
      } catch {
        router.push("/login");
      }
    };
    fetchUser();
  }, [router]);

  const handleValidation = async (e) => {
    e.preventDefault();
    setMessage('');
    
    // Validation : montant obligatoire si Livraison
    if (typeTransaction === 'Livraison' && !montant) {
      setMessage("❌ Veuillez sélectionner un montant pour la livraison.");
      return;
    }

    setLoading(true);

    try {
      const montantEnvoye = typeTransaction === 'Livraison' ? parseInt(montant) : 200;

      const res = await fetch('/api/verifier-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          nom_utilise: user.nom,
          montant: montantEnvoye,
          user_id: user.id,
          agence_id: user.agence_id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(`❌ ${data.message}`);
      } else {
        if (montantEnvoye <= 300) {
          router.push("/produits");
        } else {
          router.push("/commandes");
        }
      }
    } catch {
      setMessage('❌ Erreur de communication avec le serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div 
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
      style={{
        backgroundImage: "url('/bg-validation.jpeg')",
      }}
      >
<div className="max-w-xl mx-auto mt-20 mb-20 p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Code de validation</h1>

        <form onSubmit={handleValidation} className="space-y-4">
          <input
            type="text"
            placeholder="Code de validation"
            className="w-full border p-2 rounded"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          {/* Boutons radio Consultation / Livraison */}
          <div className="flex justify-center gap-6 mt-4">
            {["Consultation", "Livraison"].map((option) => (
              <label
                key={option}
                className={`cursor-pointer px-4 py-2 rounded-full border transition ${
                  typeTransaction === option
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                }`}
              >
                <input
                  type="radio"
                  name="typeTransaction"
                  value={option}
                  className="sr-only"
                  checked={typeTransaction === option}
                  onChange={() => {
                    setTypeTransaction(option);
                    if (option !== "Livraison") setMontant('');
                  }}
                />
                {option}
              </label>
            ))}
          </div>

          {/* Sélecteur de montant si Livraison */}
          {typeTransaction === 'Livraison' && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[1000, 1500, 2000, 3000, 4000, 5000].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`p-2 rounded border text-sm transition ${
                    montant == value
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white border-gray-300 text-gray-800 hover:border-green-400'
                  }`}
                  onClick={() => setMontant(value)}
                >
                  {value} FCFA
                </button>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
          >
            {loading ? <Loader /> : 'Valider le Code'}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm font-medium text-red-600">
            {message}
          </p>
        )}
      </div>
      </div>
    </Layout>
  );
}