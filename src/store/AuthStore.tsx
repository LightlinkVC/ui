import { makeAutoObservable, runInAction } from "mobx";
import { axiosInstance } from "../api/api.config";

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
};

class AuthStore {
  // Убрали хранение токена в localStorage
  isAuthenticated: boolean = false;

  constructor() {
    makeAutoObservable(this);
    this.initializeAuth();
  }

  // Проверяем аутентификацию при инициализации
  private initializeAuth() {
    this.isAuthenticated = this.checkAuthCookie();
  }

  private checkAuthCookie(): boolean {
    // Проверяем наличие хотя бы одного из токенов
    return !!getCookie('access_token') || !!getCookie('refresh_token');
  }

  async register(username: string, password: string) {
    try {
      await axiosInstance.post("/api/signup", { 
        username, 
        password 
      });

      // После регистрации проверяем установку кук
      runInAction(() => {
        this.isAuthenticated = this.checkAuthCookie();
      });
    } catch (error) {
      console.error("Registration failed", error);
    }
  }

  async login(username: string, password: string) {
    try {
      await axiosInstance.post("/api/login", {
        username,
        password
      });

      runInAction(() => {
        this.isAuthenticated = this.checkAuthCookie();
      });
    } catch (error) {
      console.error("Login failed", error);
    }
  }

  logout() {
    axiosInstance.post("/api/logout").finally(() => {
      runInAction(() => {
        this.isAuthenticated = false;
      });
    });
  }

  async refreshToken() {
    try {
      if (!this.checkAuthCookie()) {
        // window.location.href = "/login";
        return;
      }
      
      await axiosInstance.get("/api/refresh");
      
      runInAction(() => {
        this.isAuthenticated = this.checkAuthCookie();
      });
    } catch (error) {
      console.error("Refresh token failed", error);
      this.logout();
    }
  }
}

export const authStore = new AuthStore();