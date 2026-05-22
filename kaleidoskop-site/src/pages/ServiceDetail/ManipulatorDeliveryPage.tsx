import { Helmet } from "react-helmet-async";
import "./ServiceDetail.scss";
import type { ServiceProcessCard } from "./ServiceProcess/ServiceProcess";
import ServiceProcess from "./ServiceProcess/ServiceProcess";

const ManipulatorDeliveryPage = () => {
  const processCards: ServiceProcessCard[] = [
    {
      id: 1,
      description:
        "При оформлении заказа на сайте выберите доставку манипулятором и укажите данные для доставки. Дождитесь звонка оператора для подтверждения.",
      buttonText: "Выбрать товар в каталоге",
    },
    {
      id: 2,
      description:
        "Вы можете заказать доставку по телефону. Мы согласуем удобное время, уточним адрес и проконсультируем по всем вопросам.",
      buttonText: "Позвонить",
      isPhone: true,
    },
  ];

  return (
    <div className="service-page">
      <Helmet>
        <title>Калейдоскоп — Доставка манипулятором</title>
      </Helmet>
      <h1 className="service-title inter28-600">Доставка манипулятором</h1>

      <div className="service-page_content">
        <div className="service-page_card service-page_info inter16-400">
          <p>
            Товары доставляются по{" "}
            <span className="inter16-600">городу и области</span> прямо к вашему
            подъезду.
          </p>
          <p className="service-page_p">
            <span className="inter16-600">
              Конкретная указанная цена действует в пределах города.
            </span>{" "}
            Со стоимостью для районов можно ознакомиться в{" "}
            <span className="service-page_text__underline">
              прайсе по доставкам
            </span>
            .
          </p>

          <div className="services-page_prices">
            <div className="services-page_price">
              <span>Цена в пределах города:</span>
              <span className="inter16-600 services-page_text-accent">
                2 200 ₽
              </span>
            </div>
          </div>

          <p className="inter16-600 services-page_text-accent services-page_att">
            Обратите внимание:
          </p>
          <p>
            Доставка осуществляется до подъезда, без подъема на этаж. Если
            требуется занести товар в квартиру или офис, можно дополнительно
            оформить{" "}
            <span className="service-page_text__underline">услугу подъема</span>
            .
          </p>
        </div>
        <ServiceProcess cards={processCards} />
      </div>
    </div>
  );
};

export default ManipulatorDeliveryPage;
