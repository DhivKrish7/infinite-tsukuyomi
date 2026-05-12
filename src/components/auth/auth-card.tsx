import type * as React from "react";

export function AuthCard({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,212,255,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(167,139,250,0.10),transparent_28%)]" />
      <section className="trading-surface relative w-full max-w-md rounded-xl p-6 sm:p-8">
        <div className="mb-7">
          <div className="font-display text-xl font-extrabold tracking-tight">
            NEX<span className="text-primary">US</span>
          </div>
          <div className="mt-6">
            <h1 className="font-display text-2xl font-bold">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {children}
      </section>
    </main>
  );
}
