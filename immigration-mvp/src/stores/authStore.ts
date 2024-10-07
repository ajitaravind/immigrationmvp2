import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
interface AuthState {
  token: string | null;
  email: string | null;
  thread_id: string | null;
  setAuth: (token: string, email: string) => void;
  clearAuth: () => void;
  setThreadId: (thread_id: string) => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      token: null,
      email: null,
      thread_id: null,
      setAuth: (token, email) => set({ token, email }),
      clearAuth: () => set({ token: null, email: null, thread_id: null }),
      setThreadId: (thread_id) => set({ thread_id }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
