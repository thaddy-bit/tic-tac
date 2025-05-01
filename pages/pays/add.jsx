import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Master from "@/components/Master";

export default function AddPays() {
  const [nom, setNom] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/pays', { nom });
      router.push('/pays/list');
    } catch (error) {
      console.error("Erreur lors de l'ajout du pays", error);
    }
  };

  return (
    <Master>
      <div className="p-6 max-w-xl mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Ajouter un pays</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom du pays"
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Ajouter
        </button>
      </form>
    </div>
    </Master>
  );
}