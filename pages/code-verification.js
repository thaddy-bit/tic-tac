import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';

export default function CodeValidationPage() {
  const [code, setCode] = useState('');
  const [numeroDebiter, setNumeroDebiter] = useState('');
  const [montant, setMontant] = useState('');
  const [typeTransaction, setTypeTransaction] = useState('Consultation');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSecours, setCodeSecours] = useState('');
  const [codeSecoursRevalidation, setCodeSecoursRevalidation] = useState('');
  const [loadingRevalidation, setLoadingRevalidation] = useState(false);
  const [messageRevalidation, setMessageRevalidation] = useState('');
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [modesPaiement, setModesPaiement] = useState([]);
  const [selectedMode, setSelectedMode] = useState(null);

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

  useEffect(() => {
    fetch('/api/modes-paiement?actif=1')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setModesPaiement(list);
        // Mode "code" sélectionné par défaut s'il existe (mode par défaut du système)
        const codeMode = list.find((m) => m.type === 'code');
        if (codeMode) setSelectedMode(codeMode);
      })
      .catch(() => setModesPaiement([]));
  }, []);

  const handleValidation = async (e) => {
    e.preventDefault();
    setMessage('');
    setCodeSecours('');

    if (typeTransaction === 'Livraison' && !montant) {
      setMessage("❌ Veuillez sélectionner un montant pour la livraison.");
      return;
    }

    const isCodeMode = selectedMode?.type === 'code';
    if (isCodeMode && !code.trim()) {
      setMessage("❌ Veuillez saisir le code de validation.");
      return;
    }
    if (!isCodeMode && !numeroDebiter.trim()) {
      setMessage("❌ Veuillez saisir le numéro à débiter.");
      return;
    }

    setLoading(true);

    try {
      const montantEnvoye = typeTransaction === 'Livraison' ? parseInt(montant) : 200;

      if (isCodeMode) {
        const res = await fetch('/api/verifier-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: code.trim(),
            nom_utilise: user.nom,
            montant: montantEnvoye,
            user_id: user.id,
            agence_id: user.agence_id,
            mode_paiement: selectedMode?.nom ?? 'Code',
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setMessage(`❌ ${data.message}`);
        } else {
          if (data.type_transaction === 'consultation' && data.code_secours) {
            setCodeSecours(data.code_secours);
          } else {
            router.push(data.type_transaction === 'commande' ? "/commandes" : "/produits");
          }
        }
      } else {
        const res = await fetch('/api/paiement/mtn/request-to-pay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            montant: montantEnvoye,
            numeroDebiter: numeroDebiter.trim(),
            typeTransaction,
            payerMessage: `Paiement ${typeTransaction} - Tic-Tac`,
            payeeNote: typeTransaction,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage(`❌ ${data.message || 'Erreur demande de paiement'}`);
        } else {
          setMessage('✅ Demande envoyée. Confirmez le paiement sur votre téléphone (MoMo).');
        }
      }
    } catch {
      setMessage('❌ Erreur de communication avec le serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleAccederCatalogue = () => {
    router.push("/produits");
  };

  const handleRevalidation = async (e) => {
    e.preventDefault();
    setMessageRevalidation('');
    if (!codeSecoursRevalidation.trim()) return;
    setLoadingRevalidation(true);
    try {
      const res = await fetch('/api/revalider-code-secours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code_secours: codeSecoursRevalidation.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(data.redirect || '/produits');
      } else {
        setMessageRevalidation(data.message || 'Code invalide ou déjà utilisé.');
      }
    } catch {
      setMessageRevalidation('Erreur de communication avec le serveur.');
    } finally {
      setLoadingRevalidation(false);
    }
  };

  return (
    <Layout>
      <div
        className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
        style={{ backgroundImage: "url('/verification.png')" }}
      >
        <div className="max-w-xl mx-auto mt-20 mb-20 p-6 bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4 text-center">Paiement</h1>
          <p className="text-sm text-gray-500 text-center mb-4">Choisissez votre mode de paiement puis validez</p>

          {/* Bloc : Vous avez quitté la page ? Code de secours */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-medium text-amber-800 mb-2">Vous avez quitté la page ?</p>
            <p className="text-xs text-amber-700 mb-3">Entrez votre code de secours pour retrouver l&apos;accès sans repayer.</p>
            <form onSubmit={handleRevalidation} className="flex gap-2">
              <input
                type="text"
                placeholder="Code de secours"
                className="flex-1 border border-amber-300 p-2 rounded text-sm uppercase"
                value={codeSecoursRevalidation}
                onChange={(e) => setCodeSecoursRevalidation(e.target.value)}
              />
              <button
                type="submit"
                disabled={loadingRevalidation}
                className="px-4 py-2 bg-amber-600 text-white rounded text-sm hover:bg-amber-700 disabled:opacity-50 inline-flex items-center justify-center"
              >
                <span className="inline-flex items-center">
                  {loadingRevalidation && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                  {loadingRevalidation ? 'Revalidation...' : 'Revalider'}
                </span>
              </button>
            </form>
            {messageRevalidation && (
              <p className="mt-2 text-xs text-red-600">{messageRevalidation}</p>
            )}
          </div>

          {/* Zone unique : code de secours affiché OU formulaire de paiement (key évite erreur insertBefore) */}
          <div>
            {codeSecours ? (
              <div key="code-secours-view" className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-2">Conservez ce code de secours</p>
                <p className="text-xs text-green-700 mb-2">Si vous quittez la page, vous pourrez l&apos;utiliser pour retrouver l&apos;accès sans repayer (une seule utilisation).</p>
                <p className="text-center text-xl font-mono font-bold text-green-900 tracking-wider py-2 bg-white rounded border border-green-300">
                  {codeSecours}
                </p>
                <button
                  type="button"
                  onClick={handleAccederCatalogue}
                  className="w-full mt-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Accéder au catalogue
                </button>
              </div>
            ) : (
              <div key="payment-form-view">
                {/* Grille des icônes des modes de paiement (sans champs ni bouton) */}
                {modesPaiement.length > 0 && (
                  <div key="modes-icons" className="mb-6">
                    <div className="flex flex-wrap justify-center gap-4">
                      {modesPaiement.map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setSelectedMode(mode)}
                          className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 transition shrink-0 ${
                            selectedMode?.id === mode.id
                              ? 'border-green-600 bg-green-50 ring-2 ring-green-200'
                              : 'border-gray-200 hover:border-green-300 bg-white'
                          }`}
                          title={mode.nom}
                        >
                          {mode.logo_url ? (
                            <span className="relative w-10 h-10 block">
                              {/* eslint-disable-next-line @next/next/no-img-element -- img utilisé pour éviter erreur insertBefore avec liste dynamique de modes */}
                              <img src={mode.logo_url} alt={mode.nom} className="w-full h-full object-contain" />
                            </span>
                          ) : (
                            <span className="w-10 h-10 flex items-center justify-center rounded bg-gray-100 text-lg font-bold text-gray-500">
                              {mode.nom.charAt(0)}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formulaire affiché uniquement après clic sur une icône */}
                {selectedMode && (
                  <form key="payment-form" onSubmit={handleValidation} className="space-y-4">
                    <p className="text-sm text-gray-600">Paiement par <strong>{selectedMode.nom}</strong></p>

                    <div className="flex justify-center gap-6">
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

                    {typeTransaction === 'Livraison' && (
                      <div className="grid grid-cols-2 gap-3">
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

                    {selectedMode.type === 'code' ? (
                      <input
                        type="text"
                        placeholder="Code de validation"
                        className="w-full border p-2 rounded"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                      />
                    ) : (
                      <input
                        type="tel"
                        placeholder={`Numéro à débiter (${selectedMode.nom})`}
                        className="w-full border p-2 rounded"
                        value={numeroDebiter}
                        onChange={(e) => setNumeroDebiter(e.target.value)}
                      />
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMode(null)}
                        className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm"
                      >
                        Changer de mode
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white p-2 rounded hover:bg-green-700 transition inline-flex items-center justify-center"
                      >
                        <span className="inline-flex items-center justify-center">
                          {loading && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
                          {loading ? 'Validation...' : 'Valider le paiement'}
                        </span>
                      </button>
                    </div>
                  </form>
                )}

                {modesPaiement.length > 0 && !selectedMode && (
                  <p key="hint" className="text-sm text-gray-500 text-center">Cliquez sur un mode de paiement ci-dessus.</p>
                )}

                {message && (
                  <p key="message" className="mt-4 text-center text-sm font-medium text-red-600">{message}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}