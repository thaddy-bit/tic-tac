// components/Layout.js
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
      <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/fond.jpeg')" }}
      >
        <Navbar/>
        <main>
          {children}
        </main>
      </div>
  );
}