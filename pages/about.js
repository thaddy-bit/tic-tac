import Layout from "@/components/Layout";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function About() {
    const router = useRouter();
    const [user, setUser] = useState(null);

    // Vérifie si l'utilisateur est connecté
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (!res.ok) return router.push("/login"); // Si pas connecté, redirection vers login
                const data = await res.json();
                setUser(data);
            } catch {
                router.push("/login"); // En cas d'erreur, redirection vers login
            }
        };

        fetchUser();
    }, [router]);

    // Ne pas rendre la page si l'utilisateur n'est pas encore défini
    if (user === null) {
        return null;  // Ou un loader si tu veux
    }

    return (
        <Layout>
            <section id="services" className="py-5 px-6 bg-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <h3 className="text-xl font-bold mt-4 mb-2 text-green-600">Qui sommes nous ?</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-6xl mx-auto">
                    <p className="text-gray-900 text-xl text-justify">
                        Tictac est le leader incontesté de la vente en ligne de médicaments et de produits de parapharmacie en République du Congo. <br/>
                        Accessible 24h/24, 7j/7 et rattaché en temps réel à plusieurs pharmacies sur le territoire national, vous offre un large choix de médicaments pour toute la famille. <br/>
                        En vous rendant sur www.tictac-cg, vous avez en effet accès à un large choix de produits de pharmacie, ainsi qu aux plus grandes marques de parapharmacie et de matériel médical en ligne.
                        Forts de ce qui précèdes ci-dessus, nos clients d,éviter toutes les tracasseries de transport et de gagner un temps précieux, surtout en cas d,urgence ou pour des produits de première nécessité, un déplacement inutile, dans plusieurs pharmacies pour rechercher un produit en rupture de stock à Brazzaville mais disponible à Pointe-Noire, par exemple, de comparer les prix des produits entre différentes pharmacies partenaires, depuis la plateforme, ce qui leur permet de faire des choix économiques. <br/>
                        Comment consulter la disponibilité d,un médicament et le commander ? <br/>
                        Lancez votre navigateur web sur votre téléphone, tablette ou ordinateur, puis dans la barre d,adresse, saisissez www.tictac-cg.com , Une fois connecté à l,application Tictac, sélectionnez le service correspondant à la valeur de votre code de validation (Médicament). Saisissez ledit code d,activation dans le pop-up d,authentification, Recherchez dans la barre de recherche vos produits à chiffrer ou à commander, puis ajoutez-les dans le panier et passez votre commande. <br/>
                        <br/>Service client : +242 06 724 81 10, info@tictac-cg.com
                        </p>
                </div>
            </section>
        </Layout>
    );
}