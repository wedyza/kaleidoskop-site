import { Helmet } from "react-helmet-async";
import "./SuppliersPage.scss";

const SuppliersPage = () => {
  return (
    <div className="suppliers-page">
      <Helmet>
        <title>Калейдоскоп — Поставщики</title>
        <meta
          name="description"
          content="Калейдоскоп — интернет-магазин стройматериалов в Лесном и Нижней Туре"
        />
        <meta
          name="keywords"
          content="стройматериалы, строительные товары, магазин стройматериалов, купить стройматериалы, доставка стройматериалов, Лесной, Нижняя Тура"
        />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <h1 className="inter28-600">Поставщикам</h1>
      <div className="suppliers-content inter16-400">
        <div className="suppliers-card suppliers-info">
          <p>
            Наша компания Калейдоскоп находится в постоянном поиске новых
            поставщиков качественных строительных материалов. Мы рады продавать
            на своих площадках хорошую продукцию для ремонта и отделки
            помещений.
          </p>
          <p>
            Свяжитесь с нами, если вас заинтересовало сотрудничество с Торговой
            сетью "Калейдоскоп" — крупнейшим магазином стройматериалов в городе.
          </p>
        </div>

        <div className="suppliers-card suppliers-contacts">
          <h2 className="inter20-600">Связаться с нами:</h2>
          <div className="suppliers-contacts_content">
            <p>Kudryavceva@veleshome.ru</p>
            <p>8-800-100-16-55</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuppliersPage;
