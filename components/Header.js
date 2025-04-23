import { useState } from "react";
import { Menu, X, Home, User, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';

export default function MenuPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        
        <nav className="space-y-4">
          <Link href="/dashboard" className="flex items-center gap-2 p-3 text-white text-bold hover:bg-gray-200 rounded-lg">
            <Home size={20} /> Dashboard
          </Link>
          <Link href="/profile" className="flex items-center text-white gap-2 p-3 hover:bg-gray-200 rounded-lg">
            <User size={20}/> Profile
          </Link>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="bg-green-700 shadow-md p-4 flex justify-between items-center">
          <button className="md:hidden text-white" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h1 className="text-xl text-white font-bold">Menu</h1>
          <div className="flex gap-4">
            <Link href="/settings" className="p-2 hover:bg-gray-200 text-white rounded-lg">
              <Settings size={20} />
            </Link>
            <Link href="/logout" className="p-2 hover:bg-gray-200 text-white rounded-lg">
              <LogOut size={20} />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <p className="text-gray-600">Bienvenue sur la page du menu !</p>
        </main>
      </div>
    </div>
  );
}