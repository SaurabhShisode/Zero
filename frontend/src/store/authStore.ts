import { create } from "zustand";

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
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  }
}));
