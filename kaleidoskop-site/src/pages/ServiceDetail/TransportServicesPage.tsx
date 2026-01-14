import './ServiceDetail.scss'

const TransportServicesPage = () => {
  return (
    <div className='service-page'>
      <h1 className='service-title inter28-600'>Транспортные услуги</h1>

      <div className='service-page_content'>
        <div className='service-page_card service-page_info inter16-400'>
          <p>
            Транспортные услуги 
            предоставляются <span className='inter16-600'>с почасовой арендой авто</span>, чтобы вы 
            могли перевозить всё, что нужно, без лишних хлопот.
          </p>

          <div className='services-page_prices'>
            <div className='services-page_price'>
              <span>Авто с грузоподъемностью до <span className='inter16-600'>1,5 т</span>:</span>
              <span className='inter16-600 services-page_text-accent'>
                1 000 ₽
              </span>
            </div>
            <div className='services-page_price'>
              <span>Авто с грузоподъемностью до <span className='inter16-600'>5 т</span>:</span>
              <span className='inter16-600 services-page_text-accent'>
                2 500 ₽
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransportServicesPage