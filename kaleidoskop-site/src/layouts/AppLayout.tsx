import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { useState } from "react";
import CatalogModal from "../components/catalogModal/CatalogModal";

export const AppLayout = () => {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  return (
    <div className="page">
      <Header onCatalogClick={() => setIsCatalogOpen(!isCatalogOpen)} />
      <main className="page-content">
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
