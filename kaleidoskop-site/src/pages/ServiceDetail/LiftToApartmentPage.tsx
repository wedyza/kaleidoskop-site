import './ServiceDetail.scss'

const LiftToApartmentPage = () => {
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
      </div>
    </div>
  )
}

export default LiftToApartmentPage