// components/Navbar.tsx
import { Menu, X, Settings } from "lucide-react";
import { SetStateAction, useState } from "react";
import Link from "next/link";
import { useRouter } from 'next/router';
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
  };
  const handleSuccess = () => {
    router.push(redirectPath);
  };


  return (
      <div>
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        {/* Desktop Nav */}
        <div className="container mx-auto flex justify-center">
          <nav className="hidden md:flex gap-6 mt-10">

            <div className="pt-1.5 space-x-5">
            <Link href="/" className="hover:text-white hover:bg-green-500 p-2 transition duration-400 rounded-lg">Accueil</Link>
            <Link href="#" onClick={() => handleProtectedLinkClick("/produits")} className="hover:text-white hover:bg-green-500 p-2 transition duration-400 rounded-lg">Médicament</Link>
            <Link href="#" onClick={() => handleProtectedLinkClick("/commandes")} className="hover:text-white hover:bg-green-500 p-2 transition duration-400 rounded-lg">Commande</Link>
            </div>
            
            <div className="flex gap-2 items-center">
            <PanierBadge />
            <Link href="#" className="p-2 hover:bg-green-500 hover:text-white rounded-lg transition duration-400">
              <Settings size={20} />
            </Link>
            </div>
          </nav>
        </div>
        

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Links */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 mt-5 space-y-2 bg-green-500">
          <Link href="/" className="block hover:underline text-center pt-5 text-xl">Accueil</Link>
          <Link href="#" onClick={() => handleProtectedLinkClick("/produits")} className="block hover:underline text-center text-xl">Médicament</Link>
          <Link href="#" onClick={() => handleProtectedLinkClick("/commandes")} className="block hover:underline text-center text-xl">Commande</Link>
          <div className="flex gap-4 items-center text-center">
          <PanierBadge />
          <Link href="#" className="p-2 hover:bg-gray-200 rounded-lg">
            <Settings size={20} />
          </Link>
          </div>
        </div>
      )}

      {/* Modal de validation */}
      <CodeValidationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}