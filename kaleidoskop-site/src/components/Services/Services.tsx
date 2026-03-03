import './Services.scss'
import servicesImg from '../../assets/services.png'
import screwdriver from '../../assets/screwdriver.png'
import screw from '../../assets/screw.png'
import { Link } from 'react-router-dom'
import { SERVICES } from '../../constants/services'

const Services: React.FC = () => {
  const serviceCards = [
    { type: 'card', data: SERVICES[0], index: 0 },
    { type: 'info', index: 1 },
    { type: 'card', data: SERVICES[1], index: 2 },
    { type: 'card', data: SERVICES[2], index: 3 },
    { type: 'card', data: SERVICES[3], index: 4 },
    { type: 'card', data: SERVICES[4], index: 5 },
    { type: 'empty', index: 6 },
    { type: 'card', data: SERVICES[5], index: 7 },
    { type: 'info', index: 8 },
    { type: 'card', data: SERVICES[6], index: 9 },
    { type: 'card', data: SERVICES[7], index: 10 },
    { type: 'image', index: 11 },
  ];

  return (
    <>
      <div className='services-mobile'>
        {SERVICES.map(item => (
          <Link to={item.url} key={item.id} className="service-card services-item service-card__mobile">
            {item.hasScrewTop && (
              <div className="service-screw service-screw__top">
                <img src={screw} alt="" />
              </div>
            )}
            {item.hasScrewdriver && (
              <div className="service-screwdriver">
                <img src={screwdriver} alt="" />
              </div>
            )}
            {item.hasScrewBottom && (
              <div className="service-screw service-screw__bottom">
                <img src={screw} alt="" />
              </div>
            )}
            <div className="service_title inter18-600">
              {item.title}
            </div>
            <div className="service_desc inter14-400">
              {item.description.split(' —')[0]}
            </div>
          </Link>
        ))}
      </div>
      <div className='services'>
        {serviceCards.map((item) => {
          if (item.type === 'card' && item.data) {
            return (
              <Link to={item.data.url} key={item.data.id} className="service-card services-item">
                {item.data.hasScrewTop && (
                  <div className="service-screw service-screw__top">
                    <img src={screw} alt="" />
                  </div>
                )}
                {item.data.hasScrewdriver && (
                  <div className="service-screwdriver">
                    <img src={screwdriver} alt="" />
                  </div>
                )}
                {item.data.hasScrewBottom && (
                  <div className="service-screw service-screw__bottom">
                    <img src={screw} alt="" />
                  </div>
                )}
                <div className="service_title inter18-600">
                  {item.data.title}
                </div>
                <div className="service_desc inter14-400">
                  {item.data.description}
                </div>
                <div className="service_link inter13-500">
                  Подробнее
                </div>
              </Link>
            );
          }

          if (item.type === 'info') {
            const titles = [
              'Делаем быстро и без сбоев',
              'Все решения в одном месте'
            ];
            const descriptions = [
              'Мы организуем логистику так, чтобы вы получили товар в срок',
              'Вы не тратите время на поиски: у нас доставка, инструмент, сервис и материалы'
            ];
            
            return (
              <div key={`info-${item.index}`} className="services-item services-info">
                <div className="services-info_title inter18-500">
                  {titles[item.index === 1 ? 0 : 1]}
                </div>
                <div className="services-info_desc inter14-400">
                  {descriptions[item.index === 1 ? 0 : 1]}
                </div>
              </div>
            );
          }

          if (item.type === 'image') {
            return (
              <div key="image" className="services-item services-img">
                <img src={servicesImg} alt="" />
              </div>
            );
          }

          return <div key={`empty-${item.index}`} className="services-item services-empty" />;
        })}
      </div>
    </>
  );
};

export default Services;