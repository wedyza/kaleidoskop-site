import './ServiceDetail.scss'

const WaterDeliveryPage = () => {
  return (
    <div className='service-page'>
      <h1 className='service-title inter28-600'>Доставка воды</h1>

      <div className='service-page_content'>
        <div className='service-page_card service-page_info inter16-400'>
          <p>
            Вода доставляются по <span className='inter16-600'>городу и области</span> прямо к вашему подъезду.
          </p>
          <p className='service-page_p'>
            При покупке воды доставка предоставляется <span className='inter16-600'>бесплатно</span>. 
            Доставка выполняется до подъезда в согласованное время.
          </p>
        </div>
      </div>
    </div>
  )
}

export default WaterDeliveryPage