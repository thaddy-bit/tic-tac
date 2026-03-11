import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import axios from "axios";
import Master from "@/components/Master";
import { Edit, AlertCircle, Check, Loader } from "lucide-react";

export default function ModifierModePaiement() {
  const router = useRouter();
  const { id } = router.query;
  const [formData, setFormData] = useState({
    nom: "",
    code: "",
    type: "autre",
    actif: true,
    ordre: 0,
    description: "",
    instructions: "",
    logo_url: "",
    config_public: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      setError("Veuillez choisir une image (PNG, JPG, etc.).");
      return;
    }
    setError(null);
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const res = await axios.post("/api/upload/logo", fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data?.url) setFormData((prev) => ({ ...prev, logo_url: res.data.url }));
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'upload du logo.");
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/modes-paiement/${id}`);
        const m = res.data;
        setFormData({
          nom: m.nom || "",
          code: m.code || "",
          type: m.type || "autre",
          actif: m.actif !== false,
          ordre: m.ordre ?? 0,
          description: m.description || "",
          instructions: m.instructions || "",
          logo_url: m.logo_url || "",
          config_public: m.config_public != null ? JSON.stringify(m.config_public, null, 2) : "",
        });
      } catch {
        setError("Impossible de charger le mode de paiement");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let config_public = null;
      if (formData.config_public.trim()) {
        try {
          config_public = JSON.parse(formData.config_public);
        } catch {
          setError("Config public : JSON invalide");
          setIsSubmitting(false);
          return;
        }
      }

      await axios.put(`/api/modes-paiement/${id}`, {
        nom: formData.nom.trim(),
        code: formData.code.trim(),
        type: formData.type,
        actif: formData.actif,
        ordre: parseInt(formData.ordre, 10) || 0,
        description: formData.description.trim() || null,
        instructions: formData.instructions.trim() || null,
        logo_url: formData.logo_url.trim() || null,
        config_public,
      });

      setSuccess("Mode de paiement mis à jour avec succès");
      setTimeout(() => router.push("/modes-paiement/list"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Master>
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin h-8 w-8 text-green-600" />
        </div>
      </Master>
    );
  }

  return (
    <Master>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Edit className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">Modifier le mode de paiement</h2>
            <p className="mt-2 text-sm text-gray-600">Mise à jour des informations</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-md flex">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mr-3" />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 rounded-md flex">
              <Check className="h-5 w-5 text-green-400 flex-shrink-0 mr-3" />
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          )}

          <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom *</label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  required
                  value={formData.nom}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">Code *</label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  value={formData.code}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 font-mono"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                >
                  <option value="code">Code</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  id="actif"
                  name="actif"
                  type="checkbox"
                  checked={formData.actif}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="actif" className="ml-2 block text-sm text-gray-700">Actif</label>
              </div>

              <div>
                <label htmlFor="ordre" className="block text-sm font-medium text-gray-700">Ordre</label>
                <input
                  id="ordre"
                  name="ordre"
                  type="number"
                  min="0"
                  value={formData.ordre}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">Instructions</label>
                <textarea
                  id="instructions"
                  name="instructions"
                  rows={3}
                  value={formData.instructions}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Logo</label>
                <div className="mt-1 flex items-center gap-4 flex-wrap">
                  <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <input type="file" accept="image/*" className="sr-only" onChange={handleLogoUpload} disabled={uploadingLogo} />
                    {uploadingLogo ? "Upload..." : "Choisir un fichier"}
                  </label>
                  {formData.logo_url && (
                    <span className="flex items-center gap-2">
                      <Image src={formData.logo_url} alt="Logo" width={40} height={40} className="object-contain border rounded" unoptimized />
                      <button type="button" onClick={() => setFormData((p) => ({ ...p, logo_url: "" }))} className="text-red-600 text-sm hover:underline">
                        Retirer
                      </button>
                    </span>
                  )}
                </div>
                <input id="logo_url" name="logo_url" type="url" value={formData.logo_url} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  placeholder="URL ou après upload" />
              </div>

              <div>
                <label htmlFor="config_public" className="block text-sm font-medium text-gray-700">Config public (JSON)</label>
                <textarea
                  id="config_public"
                  name="config_public"
                  rows={4}
                  value={formData.config_public}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-75"
                >
                  <span className="inline-flex items-center">
                    {isSubmitting && <Loader className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />}
                    {isSubmitting ? "Enregistrement..." : "Mettre à jour"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Master>
  );
}
