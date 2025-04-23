import { useState } from "react";

export default function CodeValidationModal({ isOpen, onClose, onSuccess }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const verifierCode = async () => {
    setLoading(true);
    setError("");

    const res = await fetch("/api/verifier-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, nom_utilise: "Visiteur" }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      onSuccess(); // navigation
      onClose(); // close modal
    } else {
      setError(data.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Validation du code</h2>
        <input
          type="text"
          maxLength={6}
          className="w-full border p-2 text-black rounded mb-3"
          placeholder="Entrez votre code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex justify-between">
          <button
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={verifierCode}
            disabled={loading}
          >
            {loading ? "Vérification..." : "Valider"}
          </button>
        </div>
      </div>
    </div>
  );
}
