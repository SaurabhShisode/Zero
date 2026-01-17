import { create } from "zustand";
import { api } from "../api/client";

export type Preference = {
  skill: string;
  enabled: boolean;
  difficulty: "Easy" | "Medium" | "Hard";
};

type User = {
  _id: string
  name: string
  email: string
  profileSlug: string
  streak?: {
    current: number
    max: number
    freezeAvailable: number
  }
  badges?: string[]
  stats?: {
    easySolved: number
    easyTotal: number
    mediumSolved: number
    mediumTotal: number
    hardSolved: number
    hardTotal: number
  }
}



type AuthState = {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  hydrate: () => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("token"),

  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    set({ user, token });
  },

  hydrate: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await api.get("/api/auth/me");
      set({ user: res.data.user, token });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null });
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  }
}));
