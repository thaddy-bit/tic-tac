import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Head from 'next/head';

export default function Register() {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    password: '',
    role: 'simple',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ 
          text: 'Inscription réussie! Redirection...', 
          type: 'success' 
        });
        // Redirection après 2 secondes
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setMessage({ 
          text: data.message || "Erreur lors de l'inscription", 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error(error);
      setMessage({ 
        text: "Erreur réseau", 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Inscription</title>
      </Head>
      
      <div className="min-h-screen flex items-center justify-center from-blue-50 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gray-50 from-blue-600 to-indigo-700 p-6 text-center">
              <h1 className="text-3xl font-bold text-black">Créer un compte</h1>
              <p className="text-black mt-2">Rejoignez notre communauté</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              {message.text && (
                <div className={`p-3 rounded-lg text-sm flex items-center ${
                  message.type === 'error' 
                    ? 'bg-red-50 text-red-600' 
                    : 'bg-green-50 text-green-600'
                }`}>
                  <svg 
                    className="w-5 h-5 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d={
                        message.type === 'error' 
                          ? "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                          : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      } 
                    />
                  </svg>
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <div className="relative">
                    <input
                      id="prenom"
                      type="text"
                      name="prenom"
                      placeholder="Jean"
                      value={form.prenom}
                      onChange={handleChange}
                      required
                      className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <div className="relative">
                    <input
                      id="nom"
                      type="text"
                      name="nom"
                      placeholder="Dupont"
                      value={form.nom}
                      onChange={handleChange}
                      required
                      className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <input
                    id="telephone"
                    type="tel"
                    name="telephone"
                    placeholder="0612345678"
                    value={form.telephone}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="votre@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                </label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="simple">Utilisateur simple</option>
                  <option value="admin">Administrateur</option>
                  <option value="super">Super Administrateur</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-grenn-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Inscription en cours...
                  </>
                ) : "S'inscrire"}
              </button>
            </form>

            <div className="px-8 pb-6 text-center">
              <p className="text-sm text-gray-600">
                Déjà un compte?{" "}
                <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Se connecter
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}