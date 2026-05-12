"use client";

import { create } from "zustand";

export type AuthUser = {
  id: string;
  tenantId: string;
  tenantSlug: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
};

type AuthState = {
  user: AuthUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  setUser: (user: AuthUser | null) => void;
  setStatus: (status: AuthState["status"]) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "loading",
  setUser: (user) => set({ user, status: user ? "authenticated" : "unauthenticated" }),
  setStatus: (status) => set({ status })
}));
