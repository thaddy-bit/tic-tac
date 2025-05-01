import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import Master from "@/components/Master";

export default function EditPays() {
  const router = useRouter();
  const { id } = router.query;

  const [nom, setNom] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Charger les données du pays
  useEffect(() => {
    if (!id) return;

    const fetchPays = async () => {
      try {
        const res = await axios.get(`/api/pays/${id}`);
        setNom(res.data.nom);
      } catch (err) {
        setMessage("Erreur lors du chargement du pays.");
      } finally {
        setLoading(false);
      }
    };

    fetchPays();
  }, [id]);

  // Soumettre la modification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await axios.put(`/api/pays/${id}`, { nom });
      setMessage("Pays modifié avec succès !");
      setTimeout(() => router.push("/pays"), 1500); // Redirection après succès
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la mise à jour.");
    }
  };

  if (loading) return <p className="p-4">Chargement...</p>;

  return (
    <Master>
<div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Modifier un pays</h1>
      {message && <p className="mb-4 text-blue-600">{message}</p>}
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-medium">Nom du pays</label>
        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-4"
          required
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Enregistrer
        </button>
      </form>
    </div>
    </Master>
  );
}