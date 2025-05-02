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
    return null; // Évite le clignotement
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
                isActive ? "bg-green-700 text-white" : "text-white hover:bg-green-600"
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
                        ? "bg-green-700 text-white"
                        : "text-white hover:bg-green-600"
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
              isActive ? "bg-green-700 text-white" : "text-white hover:bg-green-600"
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

        <div className="mb-8">
          <Image
            src="/logo.png"
            alt="Logo"
            width={150}
            height={40}
            className="mx-auto"
          />
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        <button
          onClick={logout}
          className="mt-auto flex items-center gap-2 p-3 text-white font-semibold bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
        >
          <LogOut size={20} />
          Déconnexion
        </button>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between bg-white shadow px-4 py-3 md:hidden">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Ouvrir le menu">
            <Menu size={24} />
          </button>
          <span className="font-semibold text-lg">Tableau de bord</span>
          <div />
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}