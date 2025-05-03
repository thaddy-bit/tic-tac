import { Cross } from 'lucide-react'; // Optionnel : tu peux remplacer par une image SVG

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-green-600 space-y-4">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Cross className="w-10 h-10" />
        </div>
      </div>
      <p className="text-lg font-semibold animate-pulse">
        Vérification du code d’accès…
      </p>
    </div>
  );
}