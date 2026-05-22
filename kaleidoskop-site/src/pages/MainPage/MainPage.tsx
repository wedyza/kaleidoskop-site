import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import ItemsBlock from "../../components/ItemsBlock/ItemsBlock";
import Services from "../../components/Services/Services";
import "./MainPage.scss";
import { fetchProducts } from "../../features/products/productsSlice";
import Banners from "../../components/Banners/Banners";
import { Helmet } from "react-helmet-async";

function MainPage() {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);
  const loading = useAppSelector((state) => state.products.loading);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <div className="page-main">
      <Helmet>
        <title>Калейдоскоп — Главная страница</title>
      </Helmet>

      <Services />

      {loading ? (
        <div className="loading-indicator">Загрузка...</div>
      ) : (
        <>
          <ItemsBlock
            title={"Горячие предложения"}
            items={products.slice(0, 8)}
            icon
            dates={"06.04 - 12.04"}
          />
          <Banners group="first" />
          <ItemsBlock
            title={"Популярные товары"}
            items={products.slice(8, 14)}
          />
          <ItemsBlock title={"Новинки"} items={products.slice(14)} />
        </>
      )}

      {/* <News /> */}
    </div>
  );
}

export default MainPage;
