// components/Layout.js
import Navbar from './Navbar';
import Footer from "./Footer";
// style={{ backgroundImage: "url('/fond.jpeg')" }}

export default function Layout({ children }) {
  return (
      <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      >
        <Navbar/>
        <main>
          {children}
        </main>
        {/* Footer */}
      <Footer />
      </div>
  );
}