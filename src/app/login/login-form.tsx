"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        tenantSlug: formData.get("tenantSlug"),
        email: formData.get("email"),
        password: formData.get("password")
      })
    });

    const data = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok) {
      setError(data?.error ?? "Unable to sign in");
      return;
    }

    setUser(data.user);
    const returnTo = searchParams.get("returnTo");
    router.replace(returnTo?.startsWith("/") ? (returnTo as never) : "/");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="mb-2 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          Tenant
        </label>
        <Input name="tenantSlug" defaultValue="default" autoComplete="organization" />
      </div>
      <div>
        <label className="mb-2 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          Email
        </label>
        <Input name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <label className="mb-2 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          Password
        </label>
        <Input name="password" type="password" autoComplete="current-password" required />
      </div>

      {error ? (
        <div className="rounded-md border border-trading-red/25 bg-trading-red/10 px-3 py-2 text-sm text-trading-red">
          {error}
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        <Link className="text-primary hover:underline" href="/forgot-password">
          Forgot password?
        </Link>
      </div>
    </form>
  );
}
