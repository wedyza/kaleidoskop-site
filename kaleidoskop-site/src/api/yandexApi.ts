import axios from "axios";

const YMAPS_KEY = import.meta.env.VITE_YMAPS_API_KEY;

export const ymapsApi = axios.create({
  baseURL: "https://geocode-maps.yandex.ru/v1/",
  params: {
    apikey: YMAPS_KEY,
    format: "json",
  },
});
