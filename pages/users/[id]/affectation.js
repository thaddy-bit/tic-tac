import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function AffectationPage() {
  const router = useRouter();
  const { id } = router.query;

  const [user, setUser] = useState(null);
  const [agences, setAgences] = useState([]);
  const [selectedAgence, setSelectedAgence] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (id) {
      axios.get(`/api/utilisateurs/${id}`).then(res => {
        setUser(res.data);
        setSelectedAgence(res.data.agence_id || "");
      });

      axios.get("/api/agences").then(res => {
        setAgences(res.data);
      });
    }
  }, [id]);

  const handleAffectation = async () => {
    setLoading(true);
    setMessage("");

    try {
      await axios.put(`/api/utilisateurs/${id}/affectation`, {
        agence_id: selectedAgence || null,
      });
      setMessage("Affectation réussie !");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Erreur lors de l'affectation.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Chargement...</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Affecter {user.nom} {user.prenom} à une agence</h1>

      <label className="block mb-2 font-medium">Sélectionner une agence</label>
      <select
        className="w-full border p-2 rounded mb-4"
        value={selectedAgence || ""}
        onChange={(e) => setSelectedAgence(e.target.value)}
      >
        <option value="">-- Aucune agence --</option>
        {agences.map((agence) => (
          <option key={agence.id} value={agence.id}>
            {agence.nom} - {agence.ville}
          </option>
        ))}
      </select>

      <button
        onClick={handleAffectation}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Affectation..." : "Affecter"}
      </button>

      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
    </div>
  );
}