import { Helmet } from "react-helmet-async";
import "./ServiceDetail.scss";
import ServiceProcess, {
  type ServiceProcessCard,
} from "./ServiceProcess/ServiceProcess";

const SheetBendingPage = () => {
  const processCards: ServiceProcessCard[] = [
    {
      id: 1,
      description:
        "Закажите услуги листогиба и резки по телефону — наши специалисты согласуют время и детали работы.",
      buttonText: "Позвонить",
      isPhone: true,
    },
  ];

  return (
    <div className="service-page">
      <Helmet>
        <title>Калейдоскоп — Услуги листогиба и реза</title>
      </Helmet>
      <h1 className="service-title inter28-600">Услуги листогиба и реза</h1>

      <div className="service-page_content">
        <div className="service-page_card service-page_info inter16-400">
          <p>
            Оказываем услуги гибки и резки металлических кровельных изделий, а
            также резки фанеры, арматуры, уголков, труб, ДВП и ДСП.
          </p>
          <p className="service-page_p">
            Цены на резку{" "}
            <span className="inter16-600">
              фанеры, арматуры, уголков, труб, ДВП и ДСП
            </span>{" "}
            указаны в{" "}
            <span className="service-page_text__underline">прайсе</span>
          </p>
          <p className="service-page_p">
            Цены на{" "}
            <span className="inter16-600">
              металлические кровельные изделия
            </span>
            :
          </p>

          <div className="services-page_prices">
            <div className="services-page_price">
              <span>Услуга загиба плоского листа:</span>
              <span className="inter16-600 services-page_text-accent">
                50 ₽
              </span>
            </div>
            <div className="services-page_price">
              <span>Услуга реза плоского листа:</span>
              <span className="inter16-600 services-page_text-accent">
                30 ₽
              </span>
            </div>
          </div>
        </div>
        <ServiceProcess cards={processCards} />
      </div>
    </div>
  );
};

export default SheetBendingPage;
