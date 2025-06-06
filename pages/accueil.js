import Layout from "@/components/Layout";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Accueil() {
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
            <section className="w-full sm:px-0 py-0">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="h-96 md:h-[700px]">
                    <Image src="/Accueil_ok.jpg" priority alt="Hero Image 1" width={3000} height={1000} className="w-full h-full object-cover" unoptimized />
                </div>
                
                </div>
            </section>
            <section id="services" className="py-20 px-6 bg-gray-100">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl font-bold text-center text-green-700 mb-12"
                >
                    Nos Services
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Service 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition"
                    >
                        <Image src="/Livraison.png" width={80} height={80} alt="Livraison" />
                        <h3 className="text-xl font-bold mt-4 mb-2 text-green-600">Livraison Express</h3>
                        <p className="text-gray-600">Recevez vos médicaments à l hôpital et à domicile en un rien de temps.</p>
                    </motion.div>

                    {/* Service 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition"
                    >
                        <Image src="/Ordonances.png" width={80} height={80} alt="Ordonnance" />
                        <h3 className="text-xl font-bold mt-4 mb-2 text-green-600">Commande avec ou sans Ordonnance</h3>
                        <p className="text-gray-600">Chiffrez facilement vos ordonnances depuis notre application.</p>
                    </motion.div>

                    {/* Service 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition"
                    >
                        <Image src="/Commandes.png" width={80} height={80} alt="Commande" />
                        <h3 className="text-xl font-bold mt-4 mb-2 text-green-600">Suivi de l expédition</h3>
                        <p className="text-gray-600">Suivez en temps réel la préparation et l expédition de vos commandes.</p>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-transparent text-green-600 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl font-bold mb-6"
                >
                    Qui sommes nous ?
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <Link href="/about" className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-800 transition text-lg">
                        Suivez nous
                    </Link>
                </motion.div>
            </section>
        </Layout>
    );
}