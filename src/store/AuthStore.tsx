// AuthStore.ts
import { makeAutoObservable, runInAction } from "mobx";
import { axiosInstance } from "../api/api.config";

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
};

class AuthStore {
  isAuthenticated: boolean = false;
  userId: number | null = null;

  constructor() {
    makeAutoObservable(this);
    this.initializeAuth();
  }

  private async initializeAuth() {
    const isAuth = this.checkAuthCookie();
    runInAction(() => {
      this.isAuthenticated = isAuth;
    });
    if (isAuth) {
      await this.fetchCurrentUser();
    }
  }

  private checkAuthCookie(): boolean {
    return !!getCookie('access_token') || !!getCookie('refresh_token');
  }

  async fetchCurrentUser() {
    try {
      const response = await axiosInstance.get("/api/me");
      runInAction(() => {
        this.userId = response.data.id;
      });
    } catch (error) {
      console.error("Failed to fetch current user", error);
    }
  }

  async register(username: string, password: string) {
    try {
      const response = await axiosInstance.post("/api/signup", { 
        username, 
        password 
      });

      runInAction(() => {
        this.isAuthenticated = true;
        this.userId = response.data.userId;
      });
    } catch (error) {
      console.error("Registration failed", error);
    }
  }

  async login(username: string, password: string) {
    try {
      const response = await axiosInstance.post("/api/login", {
        username,
        password
      });

      runInAction(() => {
        this.isAuthenticated = true;
        this.userId = response.data.userId;
      });
    } catch (error) {
      console.error("Login failed", error);
    }
  }

  logout() {
    axiosInstance.post("/api/logout").finally(() => {
      runInAction(() => {
        this.isAuthenticated = false;
        this.userId = null;
      });
    });
  }

  // ... остальные методы
}

export const authStore = new AuthStore();