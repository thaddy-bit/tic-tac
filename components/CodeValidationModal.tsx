import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CodeValidationModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
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
      onClose();   // close modal
    } else {
      setError(data.message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="inset-0 flex bg-transparent items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white p-8 rounded-2xl shadow-2xl w-[90%] max-w-sm text-center relative"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-green-600">Validation du Code</h2>
            
            <input
              type="text"
              maxLength={6}
              className="w-full border p-3 text-black rounded-lg mb-4 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Entrez votre code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="flex justify-center gap-4">
              <button
                className="bg-gray-300 hover:bg-gray-400 hover:shadow-md text-gray-700 px-6 py-2 rounded-full font-semibold transition-all"
                onClick={onClose}
              >
                Annuler
              </button>
              <button
                className="bg-green-500 hover:bg-green-600 hover:shadow-md text-white px-6 py-2 rounded-full font-semibold transition-all"
                onClick={verifierCode}
                disabled={loading}
              >
                {loading ? "Vérification..." : "Valider"}
              </button>
            </div>

            {/* Petite croix pour fermer rapide */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}