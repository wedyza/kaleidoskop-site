import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let pendingRequests: ((token?: string) => void)[] = [];

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingRequests.push(() => resolve(api(originalRequest)));
      });
    }

    isRefreshing = true;

    try {
      await axios.post(
        `${API_URL}/auth/token/refresh/`,
        {},
        { withCredentials: true }
      );

      pendingRequests.forEach((cb) => cb());
      pendingRequests = [];

      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem('token');
      pendingRequests = [];
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);