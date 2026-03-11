import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import axios from "axios";
import Master from "@/components/Master";
import { Plus, AlertCircle, Check, Loader } from "lucide-react";

const initialForm = {
  nom: "",
  code: "",
  type: "autre",
  actif: true,
  ordre: 0,
  description: "",
  instructions: "",
  logo_url: "",
  config_public: "",
};

export default function AjouterModePaiement() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialForm);
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
      const formDataUpload = new FormData();
      formDataUpload.append("logo", file);
      const res = await axios.post("/api/upload/logo", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.url) {
        setFormData((prev) => ({ ...prev, logo_url: res.data.url }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'upload du logo.");
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  };

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

      await axios.post("/api/modes-paiement", {
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

      setSuccess("Mode de paiement créé avec succès");
      setTimeout(() => router.push("/modes-paiement/list"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'ajout");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Master>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">Nouveau mode de paiement</h2>
            <p className="mt-2 text-sm text-gray-600">Code, MTN Money, Airtel Money. Clés API dans .env</p>
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
                <input id="nom" name="nom" type="text" required value={formData.nom} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  placeholder="ex. MTN Money" />
              </div>
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">Code (identifiant technique) *</label>
                <input id="code" name="code" type="text" required value={formData.code} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 font-mono"
                  placeholder="ex. mtn_money" />
                <p className="mt-1 text-xs text-gray-500">Sans espaces, normalisé en minuscules. Utilisé pour les APIs.</p>
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                <select id="type" name="type" value={formData.type} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
                  <option value="code">Code</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div className="flex items-center">
                <input id="actif" name="actif" type="checkbox" checked={formData.actif} onChange={handleChange}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                <label htmlFor="actif" className="ml-2 block text-sm text-gray-700">Actif</label>
              </div>
              <div>
                <label htmlFor="ordre" className="block text-sm font-medium text-gray-700">Ordre d&apos;affichage</label>
                <input id="ordre" name="ordre" type="number" min="0" value={formData.ordre} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <input id="description" name="description" type="text" value={formData.description} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
              </div>
              <div>
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">Instructions</label>
                <textarea id="instructions" name="instructions" rows={3} value={formData.instructions} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Logo</label>
                <div className="mt-1 flex items-center gap-4">
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
                <input id="logo_url" name="logo_url" type="hidden" value={formData.logo_url} readOnly />
                <p className="mt-1 text-xs text-gray-500">Ou indiquez une URL ci-dessous.</p>
                <input id="logo_url_input" name="logo_url_input" type="url" value={formData.logo_url} onChange={(e) => setFormData((p) => ({ ...p, logo_url: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  placeholder="https://..." />
              </div>
              <div>
                <label htmlFor="config_public" className="block text-sm font-medium text-gray-700">Config public (JSON)</label>
                <textarea id="config_public" name="config_public" rows={4} value={formData.config_public} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                  placeholder='{"base_url": "...", "environment": "sandbox"}' />
                <p className="mt-1 text-xs text-gray-500">Pas de clés API ici, à mettre dans .env.</p>
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-75">
                <span className="inline-flex items-center">
                  {isSubmitting && <Loader className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />}
                  {isSubmitting ? "Enregistrement..." : "Créer le mode de paiement"}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </Master>
  );
}
