// components/Layout.js
import Master_livreur from './Master_livreur';
import Footer from "./Footer";
// style={{ backgroundImage: "url('/fond.jpeg')" }}

export default function Layout_livreur({ children }) {
  return (
      <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      >
        <Master_livreur/>
        <main>
          {children}
        </main>
        {/* Footer */}
      <Footer />
      </div>
  );
}