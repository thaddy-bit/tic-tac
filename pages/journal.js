import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Layout from "../components/Layout";
import { Download, Calendar, FileText, Clock, User, MapPin, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Journal() {
  const [commandes, setCommandes] = useState([]);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const router = useRouter();
  const pdfRef = useRef();

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
  }, [router]);

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
          // throw new Error('Erreur lors du chargement des commandes');
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
      alert("Veuillez sélectionner une période valide");
      return;
    }

    setGeneratingPDF(true);
    try {
      const filteredCommandes = commandes.filter(commande => {
        const commandeDate = new Date(commande.date_commande);
        return commandeDate >= new Date(dateDebut) && commandeDate <= new Date(dateFin);
      });

      if (filteredCommandes.length === 0) {
        alert("Aucune commande trouvée pour cette période");
        return;
      }

      // Création du PDF
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
      });

      // En-tête avec logo et informations
      doc.setFontSize(22);
      doc.setTextColor(16, 185, 129);
      doc.text("JOURNAL DES OPERATIONS TAXABLES", 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139);
      doc.text(`Période du ${new Date(dateDebut).toLocaleDateString('fr-FR')} au ${new Date(dateFin).toLocaleDateString('fr-FR')}`, 105, 30, { align: "center" });

      // Tableau principal
      autoTable(doc, {
        head: [
          [
            { content: "N° Commande", styles: { fillColor: [16, 185, 129], textColor: 255 } },
            { content: "Date", styles: { fillColor: [16, 185, 129], textColor: 255 } },
            { content: "Client", styles: { fillColor: [16, 185, 129], textColor: 255 } },
            { content: "Montant Médicaments", styles: { fillColor: [16, 185, 129], textColor: 255 } },
            { content: "Livraison", styles: { fillColor: [16, 185, 129], textColor: 255 } },
            { content: "Montant Total", styles: { fillColor: [16, 185, 129], textColor: 255 } },
            { content: "Statut", styles: { fillColor: [16, 185, 129], textColor: 255 } },
          ],
        ],
        body: filteredCommandes.map(commande => [
          commande.id,
          new Date(commande.date_commande).toLocaleDateString('fr-FR'),
          commande.client_nom,
          `${(commande.total - commande.livraison)} FCFA`,
          `${commande.livraison} FCFA`,
          `${commande.total} FCFA`,
          commande.statut.toUpperCase(),
        ]),
        startY: 50,
        theme: "grid",
        headStyles: { halign: "center" },
        columnStyles: {
          0: { cellWidth: 30, halign: "center" },
          1: { cellWidth: 25, halign: "center" },
          2: { cellWidth: 35 },
          3: { cellWidth: 30, halign: "center" },
          4: { cellWidth: 25, halign: "center" },
          5: { cellWidth: 25, halign: "center" },
          6: { cellWidth: 25, halign: "center" },
        },
        styles: { fontSize: 10, cellPadding: 3 },
        didDrawPage: function (data) {
          // Pied de page sur chaque page
          doc.setFontSize(10);
          doc.setTextColor(100, 116, 139);
          doc.text(
            `Page ${data.pageNumber}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
        },
      });

      // Section récapitulative
      const montantTotal = filteredCommandes.reduce((acc, cmd) => acc + cmd.total, 0);
      const taxeTotal = filteredCommandes.reduce((acc, cmd) => acc + cmd.livraison, 0);
      const htTotal = montantTotal - taxeTotal;

      autoTable(doc, {
        body: [
          [
            { content: "TOTAL GENERAL", styles: { fontStyle: "bold", halign: "left" } },
            { content: `${htTotal} FCFA`, styles: { fontStyle: "bold", halign: "center" } },
            { content: `${taxeTotal} FCFA`, styles: { fontStyle: "bold", halign: "center" } },
            { content: `${montantTotal} FCFA`, styles: { fontStyle: "bold", halign: "center", textColor: [16, 185, 129] } },
            { content: "", styles: { fillColor: [255, 255, 255] } },
          ],
        ],
        startY: doc.lastAutoTable.finalY + 10,
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 45 },
          2: { cellWidth: 45 },
          3: { cellWidth: 42 },
          4: { cellWidth: 42 },
        },
        styles: { fontSize: 11, cellPadding: 2 },
      });

      // Signature et cachet
      doc.setFontSize(10);
      doc.text("Cachet et signature :", 140, doc.lastAutoTable.finalY + 20);

      // Ligne de signature
      doc.setDrawColor(200, 200, 200);
      doc.line(140, doc.lastAutoTable.finalY + 25, 190, doc.lastAutoTable.finalY + 25);

      // Date de génération
      doc.text(`généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 14, doc.internal.pageSize.height - 10);

      doc.save(`journal_taxable_${dateDebut}_${dateFin}.pdf`);
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      alert("Une erreur est survenue lors de la génération du PDF");
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Calcul des totaux
  const montantTotal = commandes.reduce((acc, commande) => acc + commande.total, 0);
  const taxeTotal = commandes.reduce((acc, commande) => acc + commande.livraison, 0);
  const htTotal = montantTotal - taxeTotal;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" ref={pdfRef}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="text-green-600" size={32} />
                Journal des Opérations Taxables
              </h1>
              <p className="text-gray-500 mt-2">
                Historique complet de toutes vos transactions
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden px-3 py-2">
                <Calendar className="text-gray-400 mr-2" size={18} />
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="border-none focus:ring-0 p-0 text-sm"
                />
              </div>
              
              <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden px-3 py-2">
                <Calendar className="text-gray-400 mr-2" size={18} />
                <input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="border-none focus:ring-0 p-0 text-sm"
                />
              </div>
              
              <button
                onClick={genererPDF}
                disabled={generatingPDF}
                className={`flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition ${
                  generatingPDF ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {generatingPDF ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Génération...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Exporter PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Cartes de synthèse */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Médicaments</h3>
              <div className="bg-green-100 p-2 rounded-lg">
                <FileText className="text-green-600" size={20} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {htTotal.toLocaleString("fr-FR")} FCFA
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Livraisons</h3>
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="text-blue-600" size={20} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-semibold text-blue-600">
              {taxeTotal.toLocaleString("fr-FR")} FCFA
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Médicaments + Livraisons</h3>
              <div className="bg-purple-100 p-2 rounded-lg">
                <FileText className="text-purple-600" size={20} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-semibold text-purple-600">
              {montantTotal.toLocaleString("fr-FR")} FCFA
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {commandes.length} commande{commandes.length > 1 ? "s" : ""}
            </p>
          </motion.div>
        </div>

        {/* Liste des commandes */}
        {commandes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center"
          >
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Aucune opération enregistrée
            </h3>
            <p className="mt-1 text-gray-500">
              Vos transactions apparaîtront ici dès qu,elles seront effectuées
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {commandes.map((commande, index) => (
              <motion.div
                key={commande.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Commande #{commande.id}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            commande.statut === "en cours"
                              ? "bg-yellow-100 text-yellow-800"
                              : commande.statut === "livré"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {commande.statut}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="mr-1.5 h-4 w-4 flex-shrink-0" />
                          {new Date(commande.date_commande).toLocaleDateString("fr-FR")}
                        </div>
                        <div className="flex items-center">
                          <User className="mr-1.5 h-4 w-4 flex-shrink-0" />
                          {commande.client_nom}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-1.5 h-4 w-4 flex-shrink-0" />
                          {commande.adresse}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Montant Total</p>
                        <p className="text-xl font-semibold text-green-600">
                          {commande.total.toLocaleString("fr-FR")} FCFA
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Montant Médicaments</p>
                      <p className="font-medium">
                        {(commande.total - commande.livraison).toLocaleString("fr-FR")} FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Livraison</p>
                      <p className="font-medium text-blue-600">
                        {commande.livraison.toLocaleString("fr-FR")} FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mode de paiement</p>
                      <p className="font-medium">
                        {commande.mode_paiement || "Par code"}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}