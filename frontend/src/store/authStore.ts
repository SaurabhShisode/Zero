import { create } from "zustand";
import { api } from "../api/client";

export type Preference = {
  skill: string;
  enabled: boolean;
  difficulty: "Easy" | "Medium" | "Hard";
};

export type User = {
  id: string;
  email: string;
  name: string;
  profileSlug: string;
  preferences: Preference[];
};

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
