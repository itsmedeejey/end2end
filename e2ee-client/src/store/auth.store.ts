"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  userId: string | null;
  uniqueUserId: string | null;
  name: string | null;
  status: AuthStatus;

  setAuth: (userId: string, uniqueUserId?: string, name?: string | null) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      uniqueUserId: null,
      name: null,
      status: "loading",

      setAuth: (userId, uniqueUserId, name = null) =>
        set({
          userId,
          uniqueUserId: uniqueUserId,
          name: name,
          status: "authenticated",
        }),

      clearAuth: () =>
        set({
          uniqueUserId: null,
          name: null,
          userId: null,
          status: "unauthenticated",
        }),
    }),
    {
      // Persist user details
      name: "auth-storage",
      partialize: (state) => ({
        userId: state.userId,
        uniqueUserId: state.uniqueUserId,
        name: state.name
      }),
    }
  )
);
