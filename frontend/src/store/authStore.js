import { create } from "zustand";

const useAuthStore = create((set) => ({
  isAuthenticated: false,
  role: "GUEST", // GUEST, USER, ADMIN
  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  setRole: (value) => set({ role: value }),
}));

export default useAuthStore;
