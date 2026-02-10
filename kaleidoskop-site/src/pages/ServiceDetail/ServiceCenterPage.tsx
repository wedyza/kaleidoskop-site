import './ServiceDetail.scss'

const ServiceCenterPage = () => {
  return (
    <div className='service-page'>
      <h1 className='service-title inter28-600'>Сервисный центр</h1>

      <div className='service-page_content'>
        <div className='service-page_card service-page_info inter16-400'>
          <p>
            Оказываются услуги по <span className='inter16-600'>ремонту и 
            обслуживанию</span> оборудования и инструментов.
          </p>

          <p className='inter16-600 service-page_text-info'>Предоставляемые услуги:</p>
          <ul className='service-page_list'>
            <li className='service-page_item'>
              <span className='service-page_item-number'>
                1
              </span>
              <span className='service-page_item-text'>
                Ремонт первой категории
              </span>
            </li>
            <li className='service-page_item'>
              <span className='service-page_item-number'>
                2
              </span>
              <span className='service-page_item-text'>
                Заточка цепи
              </span>
            </li>
            <li className='service-page_item'>
              <span className='service-page_item-number'>
                3
              </span>
              <span className='service-page_item-text'>
                Заточка победитовой цепи
              </span>
            </li>
            <li className='service-page_item'>
              <span className='service-page_item-number'>
                4
              </span>
              <span className='service-page_item-text'>
                Ремонт второй категории
              </span>
            </li>
            <li className='service-page_item'>
              <span className='service-page_item-number'>
                5
              </span>
              <span className='service-page_item-text'>
                Диагностика (без ремонта)
              </span>
            </li>
            <li className='service-page_item'>
              <span className='service-page_item-number'>
                6
              </span>
              <span className='service-page_item-text'>
                Клепка цепи
              </span>
            </li>
            <li className='service-page_item'>
              <span className='service-page_item-number'>
                7
              </span>
              <span className='service-page_item-text'>
                Бесплатное обслуживание гарантийного товара
              </span>
            </li>
          </ul>

          <p>
            Стоимость данных услуг рассчитывается исходя из <span className='inter16-600'>сложности 
            работы</span> сервисного центра. 
            Вы можете проконсультироваться с сотрудником 
            по <span className='service-page_text__underline'>телефону</span>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ServiceCenterPage