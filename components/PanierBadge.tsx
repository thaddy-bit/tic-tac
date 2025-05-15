import { useEffect, useState } from 'react';
import { getPanierCount } from '@/lib/panier';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/router';

export default function PanierBadge() {
  const [count, setCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const updateCount = () => {
      setCount(getPanierCount());
    };

    updateCount();

    // Met à jour si d'autres composants modifient le localStorage
    window.addEventListener('storage', updateCount);
 
    // Optionnel : boucle locale pour mise à jour fréquente
    const interval = setInterval(updateCount, 1000);

    return () => {
      window.removeEventListener('storage', updateCount);
      clearInterval(interval);
    };
  }, []);

  const handleProtectedLinkClick = async (path: string) => {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      router.push(path);
    } else {
      router.push("/login");
    }
    // setIsOpen(false); // ferme le menu mobile
  };

  return (
    <Link href="#" onClick={() => handleProtectedLinkClick("/panier")} className="relative inline-block hover:text-white hover:bg-green-500 p-1.5 transition duration-400 rounded-lg">
      <ShoppingCart size={24} />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </Link>
  );
}