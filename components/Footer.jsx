import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-green-700 text-white py-6">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Logo + Description */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold mb-2">TicTac</h2>
          <p className="text-gray-300 max-w-xs">
            Commandez, on livre !<br /> Votre santé n'attend pas.
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-sm text-gray-300 mt-10">
        © {new Date().getFullYear()} TicTac by SMARTPUB. Tous droits réservés.
      </div>
    </footer>
  );
}