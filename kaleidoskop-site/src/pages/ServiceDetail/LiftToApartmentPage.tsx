import './ServiceDetail.scss'
import type { ServiceProcessCard } from './ServiceProcess/ServiceProcess';
import ServiceProcess from './ServiceProcess/ServiceProcess';

const LiftToApartmentPage = () => {
  const processCards: ServiceProcessCard[] = [
    {
      id: 1,
      description: 'При оформлении заказа на сайте выберите подъем товара до квартиры и укажите данные для доставки. Дождитесь звонка оператора для подтверждения.',
      buttonText: 'Выбрать товар в каталоге',
    },
    {
      id: 2,
      description: 'Оформите подъём товара по телефону — наши специалисты согласуют время и обсудят все детали работы.',
      buttonText: 'Позвонить',
      isPhone: true,
    },
  ];

  return (
    <div className='service-page'>
      <h1 className='service-title inter28-600'>Подъем товара до квартиры</h1>

      <div className='service-page_content'>
        <div className='service-page_card service-page_info inter16-400'>
          <p>
            Услуга подъема товара <span className='inter16-600'>на этаж с последующим 
            занесением и размещением в указанном помещении (квартира или офис)</span>.
          </p>
          <p className='service-page_p'>
            Подъём товара выполняется наёмными грузчиками. Цены, 
            указанные <span className='service-page_text__underline'>в прайсе</span>, <span className='inter16-600'>ориентировочные</span> и 
            могут изменяться в зависимости от объёма работы на месте.
          </p>

          <div className='services-page_prices'>
            <div className='services-page_price'>
              <span>За <span className='inter16-600'>30 минут</span> работы <span className='inter16-600'>одного грузчика:</span></span>
              <span className='inter16-600 services-page_text-accent'>
                600 ₽
              </span>
            </div>
          </div>

          <p className='inter16-600 services-page_text-accent services-page_att'>Обратите внимание:</p>
          <p>
            Услуга оформляется дополнительно к доставке
          </p>
        </div>
        <ServiceProcess cards={processCards} />
      </div>
    </div>
  )
}

export default LiftToApartmentPage