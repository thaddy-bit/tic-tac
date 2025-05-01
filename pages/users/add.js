import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Master from '../../components/Master';
import Head from 'next/head';
import { User, Lock, Mail, Phone, ArrowLeft, Loader, Check, AlertCircle } from 'lucide-react';

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
  const [redirecting, setRedirecting] = useState(false); // Etat pour gérer la redirection
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
          text: 'Enregistrement réussie! Redirection...',
          type: 'success',
        });
        setRedirecting(true); // Déclenche la redirection
      } else {
        setMessage({
          text: data.message || 'Erreur lors de l\'inscription',
          type: 'error',
        });
      }
    } catch (error) {
      console.error(error);
      setMessage({
        text: 'Erreur réseau',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Utilisation de useEffect pour rediriger après 2 secondes
  useEffect(() => {
    if (redirecting) {
      setTimeout(() => {
        router.push('/users/list');
      }, 2000);
    }
  }, [redirecting, router]);

  return (
    <Master>
      <Head>
        <title>Users</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">

          {message.text && (
            <div
              className={`mb-6 p-4 rounded-md ${
                message.type === 'error'
                  ? 'bg-red-50 text-red-800'
                  : 'bg-green-50 text-green-800'
              }`}
            >
              <div className="flex items-center">
                {message.type === 'error' ? (
                  <AlertCircle className="h-5 w-5 mr-3 text-red-500" />
                ) : (
                  <Check className="h-5 w-5 mr-3 text-green-500" />
                )}
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            </div>
          )}

          <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="prenom"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Prénom *
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      id="prenom"
                      type="text"
                      name="prenom"
                      placeholder="Jean"
                      value={form.prenom}
                      onChange={handleChange}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="nom"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nom *
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      id="nom"
                      type="text"
                      name="nom"
                      placeholder="Dupont"
                      value={form.nom}
                      onChange={handleChange}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="telephone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Téléphone *
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="telephone"
                    type="tel"
                    name="telephone"
                    placeholder="0612345678"
                    value={form.telephone}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email *
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="votre@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mot de passe *
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Rôle *
                </label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  disabled={loading}
                >
                  <option value="simple">Utilisateur simple</option>
                  <option value="admin">Administrateur</option>
                  <option value="super">Super Administrateur</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                    loading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer'
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