import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { useState } from "react";
import CatalogModal from "../components/catalogModal/CatalogModal";

export const Layout = () => {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onCatalogClick={() => setIsCatalogOpen(!isCatalogOpen)} />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
      />
    </div>
  );
};
