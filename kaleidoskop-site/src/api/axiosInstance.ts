import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // обязательно — посылать cookies
});

let isRefreshing = false;
let pendingRequests: ((token?: string) => void)[] = [];

api.interceptors.response.use(
  (res) => res,

  async (error) => {
    const originalRequest = error.config;

    // Не авторизация → просто вернуть ошибку
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Если уже идет refresh — поставить запрос в очередь
    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingRequests.push(() => resolve(api(originalRequest)));
      });
    }

    isRefreshing = true;

    try {
      // Отправляем запрос на обновление access-токена
      await axios.post(
        `${API_URL}/auth/token/refresh/`,
        {},
        { withCredentials: true }
      );

      // Успешно → выполняем все отложенные запросы
      pendingRequests.forEach((cb) => cb());
      pendingRequests = [];

      return api(originalRequest); // повторяем исходный запрос
    } catch (refreshError) {
      pendingRequests = [];
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
