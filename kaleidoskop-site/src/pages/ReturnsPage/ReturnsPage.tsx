import { Helmet } from "react-helmet-async";
import "./ReturnsPage.scss";

const ReturnsPage = () => {
  return (
    <div className="page-returns">
      <Helmet>
        <title>Калейдоскоп — Возврат товаров</title>
      </Helmet>
      <h1 className="inter28-600">Возврат товаров</h1>
      <p className="inter16-400">Здесь однажды будет информация по возвратам</p>
    </div>
  );
};
export default ReturnsPage;
