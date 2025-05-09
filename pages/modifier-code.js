import Layout from "@/components/Layout";
import { useState } from "react";
import Head from "next/head";

export default function ModifierPassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      return setError("Les mots de passe ne correspondent pas.");
    }

    try {
      const res = await fetch("/api/auth/modifier-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Mot de passe modifié avec succès.");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.message || "Une erreur est survenue.");
      }
    } catch {
      setError("Erreur réseau");
    }
  };

  return (
    <Layout>
      <Head>
        <title>Modifier le mot de passe</title>
      </Head>
      <div 
        className="min-h-screen flex items-center bg-gray-100 justify-center px-4 bg-cover bg-center"
      >
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gray-50 p-6 text-center">
              <h1 className="text-2xl font-bold text-black">Modifier mon mot de passe</h1>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Ancien mot de passe</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 text-white font-medium rounded-lg bg-green-600 hover:bg-green-700 transition"
              >
                Enregistrer
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}