import { Helmet } from "react-helmet-async";
import "./ServiceDetail.scss";
import type { ServiceProcessCard } from "./ServiceProcess/ServiceProcess";
import ServiceProcess from "./ServiceProcess/ServiceProcess";

const TransportServicesPage = () => {
  const processCards: ServiceProcessCard[] = [
    {
      id: 1,
      description:
        "При оформлении заказа на сайте выберите аренда автомобиля. Дождитесь звонка оператора для подтверждения..",
      buttonText: "Выбрать товар в каталоге",
    },
    {
      id: 2,
      description:
        "Бронируйте аренду по телефону — наши специалисты помогут выбрать подходящее авто и согласовать время.",
      buttonText: "Позвонить",
      isPhone: true,
    },
  ];

  return (
    <div className="service-page">
      <Helmet>
        <title>Калейдоскоп — Транспортные услуги</title>
      </Helmet>
      <h1 className="service-title inter28-600">Транспортные услуги</h1>

      <div className="service-page_content">
        <div className="service-page_card service-page_info inter16-400">
          <p>
            Транспортные услуги предоставляются{" "}
            <span className="inter16-600">с почасовой арендой авто</span>, чтобы
            вы могли перевозить всё, что нужно, без лишних хлопот.
          </p>

          <div className="services-page_prices">
            <div className="services-page_price">
              <span>
                Авто с грузоподъемностью до{" "}
                <span className="inter16-600">1,5 т</span>:
              </span>
              <span className="inter16-600 services-page_text-accent">
                1 000 ₽
              </span>
            </div>
            <div className="services-page_price">
              <span>
                Авто с грузоподъемностью до{" "}
                <span className="inter16-600">5 т</span>:
              </span>
              <span className="inter16-600 services-page_text-accent">
                2 500 ₽
              </span>
            </div>
          </div>
        </div>
        <ServiceProcess cards={processCards} />
      </div>
    </div>
  );
};

export default TransportServicesPage;
