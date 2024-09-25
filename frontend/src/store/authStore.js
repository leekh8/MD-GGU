import { create } from "zustand/vanilla"; // zustand/vanilla에서 import

const useAuthStore = create((set) => ({
  isAuthenticated: false,
  role: "GUEST", // GUEST, USER, ADMIN
  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  setRole: (value) => set({ role: value }),
}));

export default useAuthStore;
