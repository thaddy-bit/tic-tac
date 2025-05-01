import { useState } from "react";
import { Menu, X, Home, User, Settings, LogOut, ChevronDown, ChevronUp, Globe2, Building2 } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';

export default function MenuPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [openPays, setOpenPays] = useState(false);
  const [openVille, setOpenVille] = useState(false);
  const [openAgence, setOpenAgence] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 bg-green-400 w-64 p-5 shadow-lg transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-64"} transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}>
        <button
          className="absolute top-4 right-4 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X size={24} className="text-white" />
        </button>
        <Image src="/logo.png" priority alt="logo" width={300} height={200} className="object-cover" unoptimized />

        <nav className="space-y-4 mt-4">
          <Link href="/dashboard" className="flex items-center gap-2 p-3 text-white font-semibold hover:bg-green-600 rounded-lg">
            <Home size={20} /> Dashboard
          </Link>

          {/* USER */}
          <div>
            <button
              onClick={() => setOpenUser(!openUser)}
              className="flex justify-between items-center w-full p-3 text-white font-semibold hover:bg-green-600 rounded-lg"
            >
              <span className="flex items-center gap-2"><User size={20} /> Utilisateurs</span>
              {openUser ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {openUser && (
              <div className="ml-6 mt-1 space-y-1 text-white text-sm">
                <Link href="/users/add" className="block hover:underline">Ajouter</Link>
                <Link href="/users/list" className="block hover:underline">Liste</Link>
                <Link href="/users/edit" className="block hover:underline">Modifier</Link>
              </div>
            )}
          </div>

          {/* PAYS */}
          <div>
            <button
              onClick={() => setOpenPays(!openPays)}
              className="flex justify-between items-center w-full p-3 text-white font-semibold hover:bg-green-600 rounded-lg"
            >
              <span className="flex items-center gap-2"><Globe2 size={20} /> Pays</span>
              {openPays ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {openPays && (
              <div className="ml-6 mt-1 space-y-1 text-white text-sm">
                <Link href="/pays/add" className="block hover:underline">Ajouter</Link>
                <Link href="/pays/list" className="block hover:underline">Liste</Link>
              </div>
            )}
          </div>

          {/* VILLES */}
          <div>
            <button
              onClick={() => setOpenVille(!openVille)}
              className="flex justify-between items-center w-full p-3 text-white font-semibold hover:bg-green-600 rounded-lg"
            >
              <span className="flex items-center gap-2"><Building2 size={20} /> Villes</span>
              {openVille ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {openVille && (
              <div className="ml-6 mt-1 space-y-1 text-white text-sm">
                <Link href="/villes/add" className="block hover:underline">Ajouter</Link>
                <Link href="/villes/list" className="block hover:underline">Liste</Link>
              </div>
            )}
          </div>

          {/* AGENCES */}
          <div>
            <button
              onClick={() => setOpenAgence(!openAgence)}
              className="flex justify-between items-center w-full p-3 text-white font-semibold hover:bg-green-600 rounded-lg"
            >
              <span className="flex items-center gap-2"><Building2 size={20} /> Agences</span>
              {openAgence ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {openAgence && (
              <div className="ml-6 mt-1 space-y-1 text-white text-sm">
                <Link href="/agences/add" className="block hover:underline">Ajouter</Link>
                <Link href="/agences/list" className="block hover:underline">Liste</Link>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-green-700 shadow-md p-4 flex justify-between items-center">
          <button className="md:hidden text-white" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h1 className="text-xl text-white font-bold">Admin Panel</h1>
          <div className="flex gap-4">
            <Link href="/settings" className="p-2 hover:bg-green-600 text-white rounded-lg">
              <Settings size={20} />
            </Link>
            <Link href="/logout" className="p-2 hover:bg-green-600 text-white rounded-lg">
              <LogOut size={20} />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6">
          <p className="text-gray-600">Bienvenue sur le tableau de bord administrateur !</p>
        </main>
      </div>
    </div>
  );
}