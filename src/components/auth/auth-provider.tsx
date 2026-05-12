"use client";

import { useEffect } from "react";
import { useAuthStore, type AuthUser } from "@/stores/auth-store";

async function fetchSession(): Promise<AuthUser | null> {
  const meResponse = await fetch("/api/auth/me", {
    credentials: "include",
    cache: "no-store"
  });

  if (meResponse.ok) {
    const data = (await meResponse.json()) as { user: AuthUser };
    return data.user;
  }

  const refreshResponse = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include"
  });

  if (!refreshResponse.ok) {
    return null;
  }

  const data = (await refreshResponse.json()) as { user: AuthUser };
  return data.user;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setStatus = useAuthStore((state) => state.setStatus);

  useEffect(() => {
    let cancelled = false;

    fetchSession()
      .then((user) => {
        if (!cancelled) {
          setUser(user);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("unauthenticated");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [setStatus, setUser]);

  return children;
}
