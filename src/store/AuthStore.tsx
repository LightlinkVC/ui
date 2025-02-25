import { makeAutoObservable, runInAction } from "mobx";
import { axiosInstance } from "../api/api.config";

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookie = parts.pop();
    return cookie ? cookie.split(';').shift() || null : null;
  }
  return null;
};

class AuthStore {
  isAuthenticated = false;
  userId: number | null = null;

  constructor() {
    makeAutoObservable(this);
    this.initializeAuth();
  }

  private initializeAuth() {
    const accessToken = getCookie('access_token');
    const refreshToken = getCookie('refresh_token');
    const userId = getCookie('user_id');

    runInAction(() => {
      this.isAuthenticated = !!accessToken && !!refreshToken;
      this.userId = userId ? parseInt(userId) : null;
    });
  }

  private checkAuthCookies() {
    return !!getCookie('access_token') && !!getCookie('refresh_token');
  }

  async register(username: string, password: string) {
    try {
      await axiosInstance.post("/api/signup", { username, password });
      
      runInAction(() => {
        this.isAuthenticated = this.checkAuthCookies();
        const userIdCookie = getCookie('user_id');
        this.userId = userIdCookie ? parseInt(userIdCookie) : null;
      });
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    }
  }

  async login(username: string, password: string) {
    try {
      await axiosInstance.post("/api/login", { username, password });
      
      runInAction(() => {
        this.isAuthenticated = this.checkAuthCookies();
        const userIdCookie = getCookie('user_id');
        this.userId = userIdCookie ? parseInt(userIdCookie) : null;
      });
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  }

  logout() {
    return axiosInstance.post("/api/logout").finally(() => {
      runInAction(() => {
        this.isAuthenticated = false;
        this.userId = null;
      });
    });
  }

  async refreshToken() {
    try {
      if (!getCookie("refresh_token")) {
        window.location.href = "/login";
        return;
      }
      
      await axiosInstance.get("/api/refresh");
      
      runInAction(() => {
        this.isAuthenticated = this.checkAuthCookies();
        const userIdCookie = getCookie('user_id');
        this.userId = userIdCookie ? parseInt(userIdCookie) : null;
      });
    } catch (error) {
      console.error("Refresh token failed", error);
      this.logout();
      throw error;
    }
  }
}

export const authStore = new AuthStore();