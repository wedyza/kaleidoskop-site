import './services.scss'
import servicesImg from '../../img/services.png'
import screwdriver from '../../img/screwdriver.png'
import screw from '../../img/screw.png'

function Services () {
  return (
    <div className='services'>
      <div className="service-card services-item">
        <div className="service-screw service-screw__top">
          <img src={screw} alt="" />
        </div>
        <div className="service-screwdriver">
          <img src={screwdriver} alt="" />
        </div>
        <div className="service_title inter18-600">
          Доставка до подъезда
        </div>
        <div className="service_desc inter14-400">
          Бережно привозим заказ до 
          вашего дома — быстро, аккуратно 
          и в удобное время
        </div>
        <div className="service_link inter13-500">
          Подробнее
        </div>
      </div>
      <div className="services-item services-info">
        <div className="services-info_title inter18-500">
          Делаем быстро и без сбоев
        </div>
        <div className="services-info_desc inter14-400">
          Мы организуем логистику 
          так, чтобы вы получили товар 
          в срок
        </div>
      </div>
      <div className="service-card services-item">
        <div className="service_title inter18-600">
          Колеровка краски
        </div>
        <div className="service_desc inter14-400">
          Подбираем идеальный цвет 
          по образцу — точный оттенок 
          без компромиссов
        </div>
        <div className="service_link inter13-500">
          Подробнее
        </div>
      </div>
      <div className="service-card services-item">
        <div className="service-screw service-screw__top">
          <img src={screw} alt="" />
        </div>
        <div className="service_title inter18-600">
          Доставка воды
        </div>
        <div className="service_desc inter14-400">
          Привозим чистую бутилированную воду прямо к вам — домой, в офис или на объект
        </div>
        <div className="service_link inter13-500">
          Подробнее
        </div>
      </div>
      <div className="service-card services-item">
        <div className="service-screw service-screw__bottom">
          <img src={screw} alt="" />
        </div>
        <div className="service_title inter18-600">
          Доставка манипулятором
        </div>
        <div className="service_desc inter14-400">
          Доставляем крупные и тяжёлые грузы с подъёмом — быстро 
          и надёжно
        </div>
        <div className="service_link inter13-500">
          Подробнее
        </div>
      </div>
      <div className="service-card services-item">
        <div className="service_title inter18-600">
          Услуги листогиба
        </div>
        <div className="service_desc inter14-400">
          Изготавливаем элементы нужной формы и размера — аккуратно, 
          по вашим параметрам
        </div>
        <div className="service_link inter13-500">
          Подробнее
        </div>
      </div>
      <div className="services-item services-empty">
        
      </div>
      <div className="service-card services-item">
        <div className="service_title inter18-600">
          Сервисный цент
        </div>
        <div className="service_desc inter14-400">
          Чиним инструмент, затачиваем цепи, даём инструмент напрокат — когда нужен здесь и сейчас.
        </div>
        <div className="service_link inter13-500">
          Подробнее
        </div>
      </div>
      <div className="services-item services-info">
        <div className="services-info_title inter18-500">
          Все решения в одном месте
        </div>
        <div className="services-info_desc inter14-400">
          Вы не тратите время на поиски: 
          у нас доставка, инструмент, сервис и материалы
        </div>
      </div>
      <div className="services-item services-empty">
        
      </div>
      <div className="service-card services-item">
        <div className="service-screw service-screw__bottom">
          <img src={screw} alt="" />
        </div>
        <div className="service_title inter18-600">
          Подъем товара до квартиры
        </div>
        <div className="service_desc inter14-400">
          Поднимаем заказ до нужного 
          этажа — без хлопот, очередей 
          и тяжёлых сумок
        </div>
        <div className="service_link inter13-500">
          Подробнее
        </div>
      </div>
      <div className="services-item services-img">
        <img src={servicesImg} alt="" />
      </div>
    </div>
  )
}

export default Services;