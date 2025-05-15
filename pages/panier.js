import Layout from '../components/Layout';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Download, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
// import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import autoTable from "jspdf-autotable";

export default function PanierPage() {
  const [panier, setPanier] = useState([]);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  // const pdfRef = useRef();

  async function supprimerCodeValidation() {
    try {
      const response = await fetch('/api/auth/suppressionValidation', {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Code de validation supprimé automatiquement');
      } else {
        console.error('Erreur :', data.message);
      }
    } catch (error) {
      console.error('Erreur de requête :', error);
    }
  } 

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch {
        router.replace("/login");
      } finally {
        setLoadingUser(false);
      }
    };
    supprimerCodeValidation();
    fetchUser();
  }, [router]);
 

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('panier') || '[]');
    setPanier(stored);
  }, []);

  const updateQuantite = (id, newQuantite) => {
    const updated = panier.map((item) =>
      item.id === id ? { ...item, quantite: newQuantite } : item
    );
    setPanier(updated);
    localStorage.setItem('panier', JSON.stringify(updated));
  };

  const supprimerProduit = (id) => {
    const updated = panier.filter((item) => item.id !== id);
    setPanier(updated);
    localStorage.setItem('panier', JSON.stringify(updated));
  };

  const total = panier.reduce((acc, item) => acc + item.quantite * item.prixVente, 0);

  const generatePDF = async () => {
    if (panier.length === 0) {
      alert("Votre panier est vide");
      return;
    }
  
    setGeneratingPDF(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
      });
  
      // En-tête
      doc.setFontSize(22);
      doc.setTextColor(56, 161, 105);
      doc.text("VOTRE PANIER", 105, 20, { align: "center" });
  
      doc.setFontSize(12);
      doc.setTextColor(102, 102, 102);
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 30, { align: "center" });
  
      
      // Préparation des données du tableau
      const tableData = panier.map(item => ({
        nom: item.Nom,
        description: item.description || '',
        pharmacie: item.pharmacie_nom,
        prix: `${item.prixVente} FCFA`,
        quantite: item.quantite,
        total: `${(item.quantite * item.prixVente)} FCFA`
      }));
  
      // Tableau principal
      autoTable(doc, {
        head: [
          [
            { content: "Designation", styles: { fillColor: [56, 161, 105], textColor: 255, fontStyle: 'bold' } },
            { content: "Pharmacie", styles: { fillColor: [56, 161, 105], textColor: 255, fontStyle: 'bold' } },
            { content: "P.U", styles: { fillColor: [56, 161, 105], textColor: 255, fontStyle: 'bold' } },
            { content: "Qté", styles: { fillColor: [56, 161, 105], textColor: 255, fontStyle: 'bold' } },
            { content: "Total", styles: { fillColor: [56, 161, 105], textColor: 255, fontStyle: 'bold' } },
          ],
        ],
        body: tableData.map(item => [
          { content: item.description ? `${item.nom}\n${item.description}` : item.nom },
          item.pharmacie,
          item.prix,
          item.quantite,
          item.total
        ]),
        startY: 40,
        theme: "grid",
        headStyles: { halign: "center" },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 40 },
          2: { cellWidth: 30, halign: "center" },
          3: { cellWidth: 20, halign: "center" },
          4: { cellWidth: 30, halign: "center" },
        },
        styles: {
          fontSize: 10,
          cellPadding: 4,
          lineColor: [234, 236, 238],
          lineWidth: 0.5
        },
        didDrawCell: (data) => {
          if (data.column.index === 0 && typeof data.cell.text === 'string' && data.cell.text.includes('\n')) {
            const split = data.cell.text.split('\n');
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(split[0], data.cell.x + 2, data.cell.y + 5);
            doc.setFontSize(8);
            doc.setTextColor(102, 102, 102);
            doc.text(split[1], data.cell.x + 2, data.cell.y + 9);
          }
        },
        didDrawPage: function (data) {
          doc.setFontSize(10);
          doc.setTextColor(102, 102, 102);
          doc.text(`Page ${data.pageNumber}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        },
      });
  
      // Section récapitulative
      const sousTotal = panier.reduce((acc, item) => acc + (item.prixVente * item.quantite), 0);
      const livraison = 0; // À adapter
      const total = sousTotal + livraison;
  
      autoTable(doc, {
        body: [
          [
            { content: "TOTAL", styles: { fontStyle: "bold", halign: "left" } },
            { content: `${total} FCFA`, styles: { fontStyle: "bold", halign: "right", textColor: [56, 161, 105] } },
          ],
        ],
        startY: doc.lastAutoTable.finalY + 10,
        columnStyles: {
          0: { cellWidth: 140 },
          1: { cellWidth: 40 },
        },
        styles: { 
          fontSize: 11, 
          cellPadding: 1,
          lineColor: [56, 161, 105],
          lineWidth: 0.5
        },
      });
  
      // Pied de page
      doc.setFontSize(12);
      doc.setTextColor(102, 102, 102);
      doc.text("Merci pour votre confiance !", 105, doc.lastAutoTable.finalY + 20, { align: "center" });
      doc.text("Service client : info@tictac-cg.com | +242 06 724 61 10", 105, doc.lastAutoTable.finalY + 26, { align: "center" });
  
      doc.save(`panier-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      alert("Une erreur est survenue lors de la génération du PDF");
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loadingUser || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-12"
        >
          <div className="relative inline-block">
            <ShoppingCart className="w-12 h-12 text-green-600 mb-4" />
            <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
              {panier.length}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-green-700 text-center">
            Mon Panier
          </h1>
          <p className="text-gray-500 mt-2">
            {panier.length > 0 ? 'Vos produits sélectionnés' : 'Votre panier est vide'}
          </p>
        </motion.div>

        {panier.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-xl shadow-sm"
          >
            <ShoppingCart className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-700">
              Votre panier est vide
            </h3>
            <p className="mt-1 text-gray-500">
              Commencez par ajouter des produits à votre panier
            </p>
            <Link href="/produits">
              <button className="mt-6 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition">
                Voir les produits
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {panier.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition"
              >
                <div className="flex-1 w-full flex items-start gap-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{item.Nom}</h2>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full">
                        {item.pharmacie_nom}
                      </span>
                      <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                        {item.prixVente.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4 md:mt-0">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantite(item.id, Math.max(1, item.quantite - 0))}
                      className="px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      disabled
                      value={item.quantite}
                      min="1"
                      className="w-12 text-center border-t border-b border-gray-200 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
                      onChange={(e) => updateQuantite(item.id, parseInt(e.target.value) || 1)}
                    />
                    <button
                      onClick={() => updateQuantite(item.id, item.quantite + 0)}
                      className="px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => supprimerProduit(item.id)}
                    className="text-red-500 hover:text-red-600 transition p-2 rounded-full hover:bg-red-50"
                    title="Supprimer"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl shadow-sm border border-green-100 mt-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-medium text-gray-700">Total du panier</h3>
                  <p className="text-2xl font-bold text-green-700 mt-1">
                    {total.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                onClick={generatePDF}
                disabled={generatingPDF}
                className={`flex items-center justify-center gap-2 bg-white border border-green-600 text-green-600 hover:bg-green-50 font-medium py-3 px-6 rounded-lg transition ${
                  generatingPDF ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {generatingPDF ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Télécharger PDF
                  </>
                )}
              </button>
                  <Link href="/commandes">
                    <button className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition w-full">
                      Passer la commande
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
}
