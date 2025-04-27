// pages/account.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        router.push("/login"); // pas connecté, redirection
      }
    }
    fetchUser();
  }, []);

  if (!user) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4">Bienvenue {user.nom} 👋</h1>
        <p className="text-gray-700 mb-4">Email : {user.email}</p>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          onClick={async () => {
            await fetch("/api/logout");
            router.push("/login");
          }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}