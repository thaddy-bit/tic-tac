import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Home,
  User,
  LogOut,
  ChevronDown,
  ChevronUp,
  Globe2,
  Building2,
  Car,
  BookOpen,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

export default function MenuPage({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState(null);

  const menuItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    {
      href: "/users",
      icon: User,
      label: "Utilisateurs",
      subItems: [
        { href: "/users/add", label: "Ajouter utilisateur" },
        { href: "/users/list", label: "Liste utilisateurs" },
        { href: "/users/affecter", label: "Affectation utilisateur" },
      ],
    },
    {
      href: "/pays",
      icon: Globe2,
      label: "Gestion Pays",
      subItems: [
        { href: "/pays/add", label: "Nouveau pays" },
        { href: "/pays/list", label: "Tous les pays" },
      ],
    },
    {
      href: "/villes",
      icon: Building2,
      label: "Gestion Villes",
      subItems: [
        { href: "/villes/add", label: "Ajouter ville" },
        { href: "/villes/list", label: "Liste villes" },
      ],
    },
    {
      href: "/agences",
      icon: BookOpen,
      label: "Gestion Agences",
      subItems: [
        { href: "/agences/add", label: "Nouvelle agence" },
        { href: "/agences/list", label: "Nos agences" },
      ],
    },
    {
      href: "/automobiles",
      icon: Car,
      label: "Parc Automobile",
      subItems: [
        { href: "/automobiles/add", label: "Ajouter véhicule" },
        { href: "/automobiles/list", label: "Inventaire" },
      ],
    },
    {
      href: "/comptabilite",
      icon: DollarSign,
      label: "Comptabilité",
      subItems: [
        { href: "/comptabilite/transactions", label: "Journal transactions" },
      ],
    },
  ];

  useEffect(() => {
    setIsMounted(true);

    // Ouvrir automatiquement le sous-menu correspondant à la route actuelle
    const currentRoute = menuItems.find(item => 
      router.pathname.startsWith(item.href) || 
      (item.subItems && item.subItems.some(sub => router.pathname.startsWith(sub.href)))
    );
    if (currentRoute?.subItems) {
      setActiveSubmenu(currentRoute.href);
    }

    const handleRouteChange = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    router.events.on("routeChangeComplete", handleRouteChange);
    window.addEventListener("resize", handleResize);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
      window.removeEventListener("resize", handleResize);
    };
  }, [router]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setUser(data);
      } catch {
        router.push("/login");
      }
    };
    fetchUser();
  }, [router]);

  if (!user) {
    return null;
  }

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    router.push("/login");
  };

  const toggleSubmenu = (menu) => {
    if (!isMounted) return;
    setActiveSubmenu(activeSubmenu === menu ? null : menu);
  };

  const NavItem = ({ href, icon: Icon, label, subItems }) => {
    const isActive = router.pathname.startsWith(href);
    const hasSubItems = subItems && subItems.length > 0;
    const isSubmenuOpen = activeSubmenu === href;

    return (
      <div className="space-y-1">
        {hasSubItems ? (
          <>
            <button
              onClick={() => toggleSubmenu(href)}
              className={`flex justify-between items-center w-full p-3 font-semibold rounded-lg transition-colors ${
                isActive ? "bg-green-700 text-white" : "text-white hover:bg-green-600"
              }`}
              aria-expanded={isSubmenuOpen}
            >
              <span className="flex items-center gap-3">
                <Icon size={20} className="flex-shrink-0" />
                <span className="truncate">{label}</span>
              </span>
              {isSubmenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isSubmenuOpen ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <div className="ml-8 pl-2 mt-1 space-y-2 border-l-2 border-green-400">
                {subItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block py-2 px-3 rounded text-sm transition-colors ${
                      router.pathname === item.href
                        ? "bg-green-700 text-white"
                        : "text-white hover:bg-green-600"
                    }`}
                    legacyBehavior
                  >
                    <a className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white opacity-70"></span>
                      <span className="truncate">{item.label}</span>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : (
          <Link
            href={href}
            className={`flex items-center gap-3 p-3 font-semibold rounded-lg transition-colors ${
              isActive ? "bg-green-700 text-white" : "text-white hover:bg-green-600"
            }`}
            legacyBehavior
          >
            <a className="flex items-center gap-3">
              <Icon size={20} className="flex-shrink-0" />
              <span className="truncate">{label}</span>
            </a>
          </Link>
        )}
      </div>
    );
  };

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 bg-green-600 w-64 p-5 shadow-lg z-30 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-64"
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col overflow-hidden`}
        aria-label="Sidebar"
      >
        <button
          className="absolute top-4 right-4 md:hidden text-white hover:text-green-200 transition-colors"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Fermer le menu"
        >
          <X size={24} />
        </button>

        <div className="mb-8 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={150}
            height={40}
            className="object-contain"
            priority
          />
        </div>

        {/* Conteneur de navigation avec défilement invisible */}
        <div className="flex-1 overflow-hidden hover:overflow-y-auto pr-2 -mr-2">
          <nav className="space-y-1 h-full">
            {menuItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </nav>
        </div>

        <div className="mt-auto pt-4 border-t border-green-500">
          <div className="px-3 py-2 text-sm text-green-100">
            Connecté en tant que: <span className="font-medium">{user?.email}</span>
          </div>
          <button
            onClick={logout}
            className="w-full mt-2 flex items-center justify-center gap-2 p-3 text-white font-semibold bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between bg-white shadow px-4 py-3 md:hidden">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            aria-label="Ouvrir le menu"
            className="text-gray-600 hover:text-green-600 transition-colors"
          >
            <Menu size={24} />
          </button>
          <span className="font-semibold text-lg text-gray-800">Tableau de bord</span>
          <div className="w-6" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {children}
        </main>
      </div>

      {/* Style global pour masquer la scrollbar */}
      <style jsx global>{`
        .hover\\:overflow-y-auto::-webkit-scrollbar {
          width: 0;
          height: 0;
          background: transparent;
        }
      `}</style>
    </div>
  );
}