"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";

const demoCredentials = [
  { label: "Admin", email: "admin@nexuscrm.local", password: "Password123!" },
  { label: "Manager", email: "manager@nexuscrm.local", password: "Password123!" },
  { label: "Support", email: "support@nexuscrm.local", password: "Password123!" }
];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const [tenantSlug, setTenantSlug] = useState("default");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        tenantSlug,
        email,
        password
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
        <Input
          name="tenantSlug"
          value={tenantSlug}
          onChange={(event) => setTenantSlug(event.target.value)}
          autoComplete="organization"
        />
      </div>
      <div>
        <label className="mb-2 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          Email
        </label>
        <Input
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </div>
      <div>
        <label className="mb-2 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          Password
        </label>
        <Input
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      {process.env.NODE_ENV !== "production" ? (
        <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
            Local demo credentials
          </div>
          <div className="space-y-2">
            {demoCredentials.map((credential) => (
              <button
                key={credential.email}
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition hover:border-primary/40 hover:bg-primary/10"
                onClick={() => {
                  setTenantSlug("default");
                  setEmail(credential.email);
                  setPassword(credential.password);
                  setError(null);
                }}
              >
                <span className="min-w-0">
                  <span className="block text-xs font-medium">{credential.label}</span>
                  <span className="block truncate font-mono text-[11px] text-muted-foreground">
                    {credential.email}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                  {credential.password}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

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
