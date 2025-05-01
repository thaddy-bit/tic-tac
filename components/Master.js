import { useState, useEffect } from "react";
import { Menu, X, Home, User, Settings, LogOut, ChevronDown, ChevronUp, Globe2, Building2 } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';
import { useRouter } from "next/router";

export default function MenuPage({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    
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

    // Initial setup
    handleResize();
    router.events.on('routeChangeComplete', handleRouteChange);
    window.addEventListener('resize', handleResize);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      window.removeEventListener('resize', handleResize);
    };
  }, [router]);

  // Vérifie si l'utilisateur est connecté
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
    ////////////////////

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    router.push("/login"); // 👈 Retourne sur la page Login
  };

  const toggleSubmenu = (menu) => {
    if (!isMounted) return;
    setActiveSubmenu(activeSubmenu === menu ? null : menu);
  };

  const NavItem = ({ href, icon: Icon, label, subItems }) => {
    if (!isMounted) return null;
    
    const isActive = router.pathname.startsWith(href);
    const hasSubItems = subItems && subItems.length > 0;

    return (
      <div className="space-y-1">
        {hasSubItems ? (
          <>
            <button
              onClick={() => toggleSubmenu(href)}
              className={`flex justify-between items-center w-full p-3 font-semibold rounded-lg transition-colors ${
                isActive ? 'bg-green-700 text-white' : 'text-white hover:bg-green-600'
              }`}
              aria-expanded={activeSubmenu === href}
            >
              <span className="flex items-center gap-2">
                <Icon size={20} />
                {label}
              </span>
              {activeSubmenu === href ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {activeSubmenu === href && (
              <div className="ml-6 mt-1 space-y-2">
                {subItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block py-2 px-3 rounded text-sm transition-colors ${
                      router.pathname === item.href 
                        ? 'bg-green-700 text-white' 
                        : 'text-white hover:bg-green-600'
                    }`}
                    legacyBehavior
                  >
                    <a>{item.label}</a>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <Link
            href={href}
            className={`flex items-center gap-2 p-3 font-semibold rounded-lg transition-colors ${
              isActive ? 'bg-green-700 text-white' : 'text-white hover:bg-green-600'
            }`}
            legacyBehavior
          >
            <a className="flex items-center gap-2">
              <Icon size={20} />
              {label}
            </a>
          </Link>
        )}
      </div>
    );
  };

  const menuItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    {
      href: "/users",
      icon: User,
      label: "Utilisateurs",
      subItems: [
        { href: "/users/add", label: "Ajouter" },
        { href: "/users/list", label: "Liste" },
      ],
    },
    {
      href: "/pays",
      icon: Globe2,
      label: "Pays",
      subItems: [
        { href: "/pays/add", label: "Ajouter" },
        { href: "/pays/list", label: "Liste" },
      ],
    },
    {
      href: "/villes",
      icon: Building2,
      label: "Villes",
      subItems: [
        { href: "/villes/add", label: "Ajouter" },
        { href: "/villes/list", label: "Liste" },
      ],
    },
    {
      href: "/agences",
      icon: Building2,
      label: "Agences",
      subItems: [
        { href: "/agences/add", label: "Ajouter" },
        { href: "/agences/list", label: "Liste" },
      ],
    },
  ];

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Overlay pour mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 bg-green-600 w-64 p-5 shadow-lg z-30 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-64"
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col`}
        aria-label="Sidebar"
      >
        <button
          className="absolute top-4 right-4 md:hidden text-white"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Fermer le menu"
        >
          <X size={24} />
        </button>

        {/* Logo */}
        <div className="mb-8">
          <Image 
            src="/logo.png" 
            alt="Logo de l'application" 
            width={200} 
            height={100} 
            className="object-contain max-h-16 w-auto"
            priority
          />
        </div>

        {/* Menu scrollable */}
        <nav className="flex-1 overflow-y-auto pb-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="mt-auto pt-4 border-t border-green-700">
          <Link
            href="/settings"
            className={`flex items-center gap-2 p-3 font-semibold rounded-lg transition-colors ${
              router.pathname === '/settings' 
                ? 'bg-green-700 text-white' 
                : 'text-white hover:bg-green-600'
            }`}
            legacyBehavior
          >
            <a className="flex items-center gap-2">
              <Settings size={20} />
              Paramètres
            </a>
          </Link>
          <button
            onClick={() => {
              logout();
            }}
            className="flex items-center gap-2 p-3 font-semibold text-black hover:bg-green-600 rounded-lg transition-colors"
            legacyBehavior
          >
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-green-700 shadow-md p-4 flex justify-between items-center">
          <button 
            className="md:hidden text-white" 
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl text-white font-bold">Admin Panel</h1>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
              U
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}