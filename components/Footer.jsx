import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-green-700 text-white py-10">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Logo + Description */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold mb-2">TIC-TAC</h2>
          <p className="text-gray-300 max-w-xs">
            Votre santé est notre priorité. Livraison rapide de vos médicaments et conseils personnalisés.
          </p>
        </div>

        {/* Réseaux sociaux */}
        <div className="flex flex-col items-center md:items-end">
          <h3 className="text-lg font-semibold mb-2">Suivez-nous</h3>
          <div className="flex text-white gap-4">
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-sm text-gray-300 mt-10">
        © {new Date().getFullYear()} Tic-Tac. Tous droits réservés.
      </div>
    </footer>
  );
}