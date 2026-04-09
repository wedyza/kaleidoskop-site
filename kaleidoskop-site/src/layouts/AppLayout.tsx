import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { useEffect, useState } from "react";
import CatalogModal from "../components/CatalogModal/CatalogModal";

export const AppLayout = () => {
  const [isCatalogOpen, setIsCatalogOpen] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setIsCatalogOpen(false);
  }, [location.pathname]);

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
