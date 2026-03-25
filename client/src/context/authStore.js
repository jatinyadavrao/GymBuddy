import { create } from "zustand";

const tokenKey = "gymbuddy_token";
const userKey = "gymbuddy_user";

export const authStore = create((set) => ({
  token: localStorage.getItem(tokenKey) || "",
  user: JSON.parse(localStorage.getItem(userKey) || "null"),
  setAuth: ({ token, user }) => {
    localStorage.setItem(tokenKey, token);
    localStorage.setItem(userKey, JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    set({ token: "", user: null });
  },
  refreshUser: (user) => {
    localStorage.setItem(userKey, JSON.stringify(user));
    set({ user });
  }
}));
