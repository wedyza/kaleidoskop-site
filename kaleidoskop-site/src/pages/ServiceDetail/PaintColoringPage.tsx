import './ServiceDetail.scss'

const PaintColoringPage = () => {
  return (
    <div className='service-page'>
      <h1 className='service-title inter28-600'>Колеровка краски</h1>

      <div className='service-page_content'>
        <div className='service-page_card service-page_info inter16-400'>
          <p className='service-page_info-p__wide'>
            При покупке в наших магазинах, услуга колеровки
            предоставляется <span className='inter16-600'>бесплатно</span>, оплачиваются только необходимые колеры.
          </p>
          <p className='service-page_p service-page_info-p__narrow'>
            При колеровке краски, приобретенной отдельно, 
            стоимость услуги <span className='inter16-600'>рассчитывается по прайс-листу</span>.
          </p>

          <div className='services-page_prices'>
            <div className='services-page_price'>
              <span>За штуку:</span>
              <span className='inter16-600 services-page_text-accent'>
                500 ₽
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaintColoringPage