// components/Navbar.tsx
import { Menu, X, Settings } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import PanierBadge from '@/components/PanierBadge';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  //  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState(null);
  // const [modalOpen, setModalOpen] = useState(false);
  // const [redirectPath, setRedirectPath] = useState("");

  // Vérifie si l'utilisateur est connecté
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("Non connecté");
        const data = await res.json();
        setUser(data); // Stocker l'utilisateur
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);
  ////////////////////

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    router.push("/login"); // 👈 Retourne sur la page Login
  };

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="lg:sticky top-0 z-50 bg-white/70 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/accueil" className="text-2xl font-bold text-green-600">
          <Image src="/LogoVert.png" width={150} height={80} alt="Livraison" />
          <div className="flex">
          <p className="text-sm font-bold text-black pr-2">in line : </p>
          <p className="text-sm font-bold text-red-600">{ }</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex gap-8 text-lg">
            <Link href="/accueil" className="hover:text-white hover:bg-green-500 px-3 py-2 rounded-lg transition duration-300 ease-in-out">
              Accueil
            </Link>

            <Link href="/produits" className="hover:text-white hover:bg-green-500 px-3 py-2 rounded-lg transition duration-300 ease-in-out">
            Médicament
            </Link>

            <Link href="/journal" className="hover:text-white hover:bg-green-500 px-3 py-2 rounded-lg transition duration-300 ease-in-out">
            Historique Commande
            </Link>
          </nav>

          {/* Panier + Settings */}
          <div className="flex gap-4 items-center ml-8 relative" ref={dropdownRef}>
            <PanierBadge />
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="p-2 hover:bg-green-500 hover:text-white rounded-lg transition duration-300 ease-in-out">
              <Settings size={20} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg py-2"
                >
                  {user ? (
                    <>
                      <Link href="#" className="block px-4 py-2 hover:bg-green-100 text-gray-700" onClick={() => setIsDropdownOpen(false)}>
                        Mon Profil
                      </Link>
                      <Link href="/journal" className="block px-4 py-2 hover:bg-green-100 text-gray-700" onClick={() => setIsDropdownOpen(false)}>
                        Mes Commandes
                      </Link>
                      <Link href="/modifier-code" className="block px-4 py-2 hover:bg-green-100 text-gray-700" onClick={() => setIsDropdownOpen(false)}>
                        Changer Mot de Passe
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-green-100 text-red-500"
                      >
                        Déconnexion
                      </button>
                    </>
                  ) : (
                    <Link href="/login" className="block px-4 py-2 hover:bg-green-100 text-gray-700" onClick={() => setIsDropdownOpen(false)}>
                      Se connecter
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white shadow-inner overflow-hidden flex flex-col items-center gap-4 py-4"
          >
            <Link href="/accueil" onClick={() => setIsOpen(false)} className="text-lg hover:text-green-500 transition">
              Accueil
            </Link>

            <Link href="/produits" onClick={() => setIsOpen(false)} className="text-lg hover:text-green-500 transition">
              Médicament
            </Link>

            <Link href="/journal" onClick={() => setIsOpen(false)} className="text-lg hover:text-green-500 transition">
            Historique Commande
            </Link>
            
            <div className="flex gap-4 items-center">
              <PanierBadge />
              {/* Le bouton settings mobile peut rester sans dropdown pour simplifier */}
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="p-2 hover:bg-green-500 hover:text-white rounded-lg transition duration-300 ease-in-out">
              <Settings size={20} />
              </button>
              <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg py-2"
                >
                  {user ? (
                    <>
                      <Link href="#" className="block px-4 py-2 hover:bg-green-100 text-gray-700" onClick={() => setIsDropdownOpen(false)}>
                        Mon Profil
                      </Link>
                      <Link href="/journal" className="block px-4 py-2 hover:bg-green-100 text-gray-700" onClick={() => setIsDropdownOpen(false)}>
                        Mes Commandes
                      </Link>
                      <Link href="/modifier-code" className="block px-4 py-2 hover:bg-green-100 text-gray-700" onClick={() => setIsDropdownOpen(false)}>
                        Changer Mot de Passe
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-green-100 text-red-500"
                      >
                        Déconnexion
                      </button>
                    </>
                  ) : (
                    <Link href="/login" className="block px-4 py-2 hover:bg-green-100 text-gray-700" onClick={() => setIsDropdownOpen(false)}>
                      Se connecter
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
              
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}