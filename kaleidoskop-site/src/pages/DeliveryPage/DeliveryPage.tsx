import './DeliveryPage.scss'

const DeliveryPage = () => {
  return (
    <div className='page-del'>
      <h1 className='inter28-600'>Доставка и оплата</h1>
      <div className='del-content inter16-400'>
        <div className='del-info'>
          <h2 className='inter16-600'>Информация о доставке</h2>
          <ol className='del-info_list'>
            <li className='del-info_item'>
              ТС "Калейдоскоп" осуществляет услуги доставки до подъезда, 
              садового участка, дома и т.д. по всей Свердловской области.
            </li>
            <li className='del-info_item'>
              Стоимость доставки будет поставлена автоматически при оформлении заказа с указанным точным адресом.
            </li>
            <li className='del-info_item'>
              <span>
                Если необходимого адреса нет в списке доставок, то по стоимости вас проконсультируют по 
                телефону <span className='inter16-600'>8 909-000-49-93</span> при согласовании заказа, либо по 
                номеру <span className='inter16-600'>8-800-100-1655</span>. Также можно узнать 
                стоимость доставки при помощи <span className='inter16-600'>калькулятора доставок</span>.
              </span>
            </li>
            <li className='del-info_item'>
              Доставки осуществляются с понедельника по субботу, в удобное для Вас время.
            </li>
            <li className='del-info_item'>
              Расчет расстояния за километр. Определяется на основании программы 
              используемой Грузоперевозчиками РФ. www.avtodispetcher.ru
            </li>
            <li className='del-info_item'>
              «Экспресс доставка» двойной тариф.
            </li>
            <li className='del-info_item'>
              Доставка осуществляется в короткое время, машина на загрузку встает в течение 2 часов после покупки.
            </li>
          </ol>
        </div>
        
        <div className='del-info'>
          <h2 className='inter16-600'>Способы оплаты</h2>
          <ol className='del-info_list'>
            <li className='del-info_item'>
              Оплата наличными или картой при получении.
            </li>
            <li className='del-info_item'>
              <div className='del-info_item-text'>
                <span>Оплата заказа в интернет-магазине.</span>
                <span className='del-info_item-text__grey'>
                  Оплата производится на сайте с помощью банковских карт, после формирования заказа и подтверждения  его обработки.
                </span>
              </div>
            </li>
            <li className='del-info_item'>
              <div className='del-info_item-text'>
                <span>Оплата на кассе.</span>
                <span className='del-info_item-text__grey'>
                  При самовывозе товара из наиболее удобного для вас магазина "Калейдоскоп", вы 
                  можете оплатить заказ на кассе Администратора наличными, либо банковской картой.
                </span>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default DeliveryPage;