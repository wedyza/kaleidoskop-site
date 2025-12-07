import { ymapsApi } from "../../api/yandexApi";

export interface ParsedAddress {
  city: string;
  street: string;
  house: string;
}

export const parseAddressWithYandex = async (addressString: string): Promise<ParsedAddress> => {
  try {
    const response = await ymapsApi.get('', {
      params: { 
        geocode: addressString, 
        format: "json",
        results: 1,
        lang: 'ru_RU'
      },
    });

    const components = response.data.response.GeoObjectCollection.featureMember[0]
      .GeoObject.metaDataProperty.GeocoderMetaData.Address.Components;

    let city = '';
    let street = '';
    let house = '';

    for (const component of components) {
      if (component.kind === 'locality' && !city) {
        city = component.name;
      }
      if (component.kind === 'street' && !street) {
        street = component.name;
      }
      if (component.kind === 'house' && !house) {
        house = component.name;
      }
    }

    if (!city || !street || !house) {
      throw new Error('Не удалось получить все компоненты адреса');
    }

    return { city, street, house };
  } catch (error) {
    throw new Error(`Ошибка парсинга адреса: ${String(error)}`);
  }
};