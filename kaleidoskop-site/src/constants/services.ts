export interface Service {
  id: number;
  title: string;
  description: string;
  url: string;
  hasScrewTop?: boolean;
  hasScrewdriver?: boolean;
  hasScrewBottom?: boolean;
}

export const SERVICES: Service[] = [
  {
    id: 1,
    title: 'Доставка до подъезда',
    description: 'Бережно привозим заказ до вашего дома — быстро, аккуратно и в удобное время',
    url: '/services/delivery-to-entrance',
    hasScrewTop: true,
    hasScrewdriver: true,
  },
  {
    id: 2,
    title: 'Колеровка краски',
    description: 'Подбираем идеальный цвет по образцу — точный оттенок без компромиссов',
    url: '/services/paint-coloring',
  },
  {
    id: 3,
    title: 'Доставка воды',
    description: 'Привозим чистую бутилированную воду прямо к вам — домой, в офис или на объект',
    url: '/services/water-delivery',
    hasScrewTop: true,
  },
  {
    id: 4,
    title: 'Доставка манипулятором',
    description: 'Доставляем крупные и тяжёлые грузы с подъёмом — быстро и надёжно',
    url: '/services/manipulator-delivery',
    hasScrewBottom: true,
  },
  {
    id: 5,
    title: 'Услуги листогиба',
    description: 'Изготавливаем элементы нужной формы и размера — аккуратно, по вашим параметрам',
    url: '/services/sheet-bending',
  },
  {
    id: 6,
    title: 'Сервисный центр',
    description: 'Чиним инструмент, затачиваем цепи, даём инструмент напрокат — когда нужен здесь и сейчас.',
    url: '/services/service-center',
  },
  {
    id: 7,
    title: 'Транспортные услуги',
    description: 'Почасовая аренда авто — удобная перевозка стройматериалов любого размера',
    url: '/services/transport-services',
    hasScrewBottom: true,
  },
  {
    id: 8,
    title: 'Подъем товара до квартиры',
    description: 'Поднимаем заказ до нужного этажа — без хлопот, очередей и тяжёлых сумок',
    url: '/services/lift-to-apartment',
    hasScrewBottom: true,
  },
];