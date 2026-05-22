import { Helmet } from "react-helmet-async";
import "./ServiceDetail.scss";
import ServiceProcess, {
  type ServiceProcessCard,
} from "./ServiceProcess/ServiceProcess";

const WaterDeliveryPage = () => {
  const processCards: ServiceProcessCard[] = [
    {
      id: 1,
      description:
        "Оформите доставку воды по телефону — наши специалисты согласуют удобное время и все детали.",
      buttonText: "Позвонить",
      isPhone: true,
    },
  ];

  return (
    <div className="service-page">
      <Helmet>
        <title>Калейдоскоп — Доставка воды</title>
      </Helmet>
      <h1 className="service-title inter28-600">Доставка воды</h1>

      <div className="service-page_content">
        <div className="service-page_card service-page_info inter16-400">
          <p>
            Вода доставляются по{" "}
            <span className="inter16-600">городу и области</span> осуществляется
            до квартиры.
          </p>
          <p className="service-page_p">
            При покупке воды доставка предоставляется{" "}
            <span className="inter16-600">бесплатно</span>. Доставка выполняется
            до подъезда в согласованное время.
          </p>
        </div>
        <ServiceProcess cards={processCards} />
      </div>
    </div>
  );
};

export default WaterDeliveryPage;
