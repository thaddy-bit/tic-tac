import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Layout from "../components/Layout";

export default function Journal() {
  const [commandes, setCommandes] = useState([]);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Vérifie si l'utilisateur est connecté
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) return router.push("/login");

        const data = await res.json();
        setUser(data);
      } catch {
        router.push("/login");
      }
    };

    fetchUser();
  }, []);

  // Récupère les commandes de l'utilisateur connecté
  useEffect(() => {
    if (!user) return;

    const fetchCommandes = async () => {
      try {
        const commandesRes = await fetch('/api/journal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
          }),
        });

        if (commandesRes.ok) {
          const data = await commandesRes.json();
          setCommandes(data);
        } else {
          throw new Error('Erreur lors du chargement des commandes');
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommandes();
  }, [user]);

  const genererPDF = async () => {
    if (!dateDebut || !dateFin) {
      alert("Veuillez sélectionner les deux dates.");
      return;
    }

    try {
      const res = await fetch(`/api/commandes/pdf?date_debut=${dateDebut}&date_fin=${dateFin}&user_id=${user.id}`);
      if (!res.ok) {
        throw new Error('Erreur lors de la récupération des commandes.');
      }
      const data = await res.json();

      const doc = new jsPDF();

      // HEADER
      doc.setFontSize(22);
      doc.setTextColor(41, 128, 185);
      doc.text("Journal des Commandes", 14, 20);

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Période : ${dateDebut} ➔ ${dateFin}`, 14, 30);

      // TABLE
      const rows = data.map((commande) => [
        commande.id,
        new Date(commande.date_commande).toLocaleDateString(),
        commande.statut,
        `${commande.livraison.toLocaleString('fr-FR')} FCFA`
      ]);

      autoTable(doc, {
        head: [['N° Commande', 'Date', 'Statut', 'Montant']],
        body: rows,
        startY: 40,
        theme: 'striped',
        styles: { fontSize: 11 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      // FOOTER
      const dateGeneration = new Date().toLocaleString();
      doc.setFontSize(10);
      doc.text(`Généré le : ${dateGeneration}`, 14, doc.internal.pageSize.height - 10);

      doc.save(`journal_commandes_${dateDebut}_${dateFin}.pdf`);
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la génération du PDF.');
    }
  };

  // Calcul du montant total des commandes
  const montantTotal = commandes.reduce((total, commande) => total + commande.total, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Chargement...</p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6 text-green-600">Journal de vos commandes</h1>

        {/* Filtres dates + bouton PDF */}
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 mb-6">
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="border p-2 rounded w-full md:w-auto"
          />
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="border p-2 rounded w-full md:w-auto"
          />
          <button
            onClick={genererPDF}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2 rounded w-full md:w-auto"
          >
            Exporter PDF
          </button>
        </div>

        {/* Montant total */}
        <div className="bg-blue-100 p-4 rounded-lg mb-6">
          <p className="font-semibold text-lg">Montant total des commandes : <span className="text-blue-600">{montantTotal.toLocaleString('fr-FR')} FCFA</span></p>
        </div>

        {/* Liste commandes */}
        <div className="space-y-4">
          {commandes.length === 0 ? (
            <p className="text-gray-600">Aucune commande trouvée.</p>
          ) : (
            commandes.map((commande) => (
              <div key={commande.id} className="border rounded-lg p-4 shadow-lg hover:shadow-2xl transition duration-300 ease-in-out">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-xl font-semibold">Commande #{commande.id}</span>
                    <span className="text-sm"> / {commande.client_nom}</span>
                    <span className="text-sm"> / {commande.adresse}</span>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    commande.statut === 'en cours' ? 'bg-yellow-200 text-yellow-800' :
                    commande.statut === 'livré' ? 'bg-green-200 text-green-800' :
                    'bg-red-200 text-red-800'
                  }`}>
                    {commande.statut}
                  </span>
                </div>
                <p className="text-gray-600">Date : {new Date(commande.date_commande).toLocaleDateString()}</p>
                <div className="lg:flex space-x-5">
                <p className="font-semibold text-blue-600">Livraison : {commande.livraison.toLocaleString('fr-FR')} FCFA</p>
                <p className="font-semibold text-red-600"> Total : {commande.total.toLocaleString('fr-FR')} FCFA</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}