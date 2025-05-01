import Master from "@/components/Master";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
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

  return (
    <Master>
      <div className="container mx-auto px-4 py-6">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
            <p className="text-gray-600">Analyse des performances de l'application</p>
          </div>
        </div>
      </div>
    </Master>
  );
}