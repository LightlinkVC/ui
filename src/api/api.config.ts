import axios from "axios";
import { authStore } from "../store/AuthStore";

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) return parts.pop()?.split(';').shift();
};

export const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: "http://localhost/",
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

axiosInstance.interceptors.request.use((config) => {
  const accessToken = getCookie('access_token');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.log("Retry: ", originalRequest._isRetry)
    if (error.response.status === 401 && !originalRequest._isRetry) {
      originalRequest._isRetry = true;

      try {
        await authStore.refreshToken();

        return axiosInstance.request(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed or expired", refreshError);
        authStore.logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);