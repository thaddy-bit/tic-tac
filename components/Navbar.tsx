// components/Navbar.tsx
import { Menu, X, Settings } from "lucide-react";
import Image from "next/image";
import { SetStateAction, useState } from "react";
import Link from "next/link";
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import PanierBadge from '@/components/PanierBadge';
import CodeValidationModal from "./CodeValidationModal";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState("");

  const handleProtectedLinkClick = (path: SetStateAction<string>) => {
    setRedirectPath(path);
    setModalOpen(true);
    setIsOpen(false); // Ferme le menu mobile après clic
  };

  const handleSuccess = () => {
    router.push(redirectPath);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-green-600">
          <Image src="/LogoVert.png" width={150} height={80} alt="Livraison" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {/* Centered links */}
          <nav className="flex gap-8 text-lg">
            <Link href="/" className="hover:text-white hover:bg-green-500 px-3 py-2 rounded-lg transition duration-300 ease-in-out">
              Accueil
            </Link>
            <Link href="#" onClick={() => handleProtectedLinkClick("/produits")} className="hover:text-white hover:bg-green-500 px-3 py-2 rounded-lg transition duration-300 ease-in-out">
              Médicament
            </Link>
            <Link href="#" onClick={() => handleProtectedLinkClick("/commandes")} className="hover:text-white hover:bg-green-500 px-3 py-2 rounded-lg transition duration-300 ease-in-out">
              Commande
            </Link>
          </nav>

          {/* Panier + Settings alignés à droite */}
          <div className="flex gap-4 items-center ml-8">
            <PanierBadge />
            <Link href="#" className="p-2 hover:bg-green-500 hover:text-white rounded-lg transition duration-300 ease-in-out">
              <Settings size={20} />
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation with Framer Motion */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white shadow-inner overflow-hidden flex flex-col items-center gap-4 py-4"
          >
            <Link href="/" onClick={() => setIsOpen(false)} className="text-lg hover:text-green-500 transition">
              Accueil
            </Link>
            <Link href="#" onClick={() => handleProtectedLinkClick("/produits")} className="text-lg hover:text-green-500 transition">
              Médicament
            </Link>
            <Link href="#" onClick={() => handleProtectedLinkClick("/commandes")} className="text-lg hover:text-green-500 transition">
              Commande
            </Link>
            <div className="flex gap-4 items-center">
              <PanierBadge />
              <Link href="#" className="p-2 hover:bg-green-500 hover:text-white rounded-lg transition duration-300 ease-in-out">
                <Settings size={20} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de validation */}
      <CodeValidationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </header>
  );
}