"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  userId: string | null;
  accessToken: string | null;
  status: AuthStatus;

  setAuth: (userId: string, token?: string | null) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      accessToken: null,
      status: "loading",

      setAuth: (userId, token = null) =>
        set({
          userId,
          accessToken: token,
          status: "authenticated",
        }),

      clearAuth: () =>
        set({
          userId: null,
          accessToken: null,
          status: "unauthenticated",
        }),
    }),
    {
      // Persist only userId. Access token stays in memory.
      name: "auth-storage",
      partialize: (state) => ({
        userId: state.userId,
      }),
    }
  )
);
