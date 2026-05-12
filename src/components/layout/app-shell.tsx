"use client";

import type * as React from "react";
import {
  Activity,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  PlugZap,
  Search,
  ShieldCheck,
  UserPlus,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useDashboardStore } from "@/stores/dashboard-store";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: string;
  badgeTone?: "green" | "red";
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/" },
      { label: "Analytics", icon: BarChart3, href: "/analytics" }
    ]
  },
  {
    label: "Clients",
    items: [
      { label: "All Clients", icon: Users, href: "/clients", badge: "847", badgeTone: "green" },
      { label: "Leads", icon: UserPlus, href: "/leads", badge: "23" },
      { label: "Onboarding", icon: Activity, href: "/onboarding" },
      { label: "KYC Queue", icon: ShieldCheck, href: "/kyc", badge: "11" }
    ]
  },
  {
    label: "Trading",
    items: [
      { label: "Accounts", icon: BriefcaseBusiness, href: "/trading/accounts" },
      { label: "Positions", icon: Activity, href: "/trading/positions" },
      { label: "Platforms", icon: PlugZap, href: "/platforms" }
    ]
  },
  {
    label: "Finance",
    items: [
      { label: "Deposits", icon: CircleDollarSign, href: "/finance/deposits" },
      { label: "Withdrawals", icon: CircleDollarSign, href: "/finance/withdrawals", badge: "5" },
      { label: "Commissions", icon: BarChart3, href: "/finance/commissions" }
    ]
  }
];

const platformPlugins = [
  { name: "NebulFX", meta: "614 clients · Live", color: "#818cf8", connected: true },
  { name: "SquidFX", meta: "233 clients · Live", color: "#22d3a5", connected: true },
  { name: "TradeXo", meta: "API key required", color: "#6b7a99", connected: false }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen } = useDashboardStore();
  const { user, setUser } = useAuthStore();

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });
    setUser(null);
    router.replace("/login");
    router.refresh();
  }

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex min-h-screen overflow-hidden bg-background text-foreground">
        <aside className="hidden h-screen w-64 shrink-0 border-r border-white/10 bg-card lg:block">
          <SidebarContent />
        </aside>

        <SheetContent>
          <SidebarContent />
        </SheetContent>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 bg-card px-4 sm:px-6">
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open navigation</span>
            </Button>
          </SheetTrigger>

          <div className="min-w-0">
            <h1 className="truncate font-display text-base font-semibold">Dashboard</h1>
            <p className="hidden text-xs text-muted-foreground sm:block">All platforms · Live operations</p>
          </div>

          <div className="ml-auto hidden w-full max-w-sm items-center gap-2 rounded-md border border-white/10 bg-secondary px-3 md:flex">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              className="h-9 border-0 bg-transparent px-0 focus-visible:ring-0"
              placeholder="Search clients, accounts, trades..."
            />
          </div>

          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            <PlugZap className="h-4 w-4" />
            Platforms
          </Button>
          <Button size="sm" className="hidden sm:inline-flex">
            <UserPlus className="h-4 w-4" />
            New Client
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-trading-red" />
            <span className="sr-only">Notifications</span>
          </Button>
          <div className="hidden min-w-0 text-right sm:block">
            <div className="max-w-32 truncate text-xs font-medium">{user?.name ?? "Staff"}</div>
            <div className="max-w-32 truncate font-mono text-[10px] text-muted-foreground">
              {user?.roles[0] ?? "SESSION"}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
      </main>
      </div>
    </Sheet>
  );
}

function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="font-display text-xl font-extrabold tracking-tight">
          NEX<span className="text-primary">US</span>
        </div>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          CRM Platform
        </div>
      </div>

      <nav className="space-y-5 px-3 py-5">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {section.label}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href as never}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground",
                    (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))) &&
                      "bg-primary/10 text-primary"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.badge ? (
                    <span
                      className={cn(
                        "rounded-full bg-trading-red px-2 py-0.5 text-[10px] font-semibold text-white",
                        item.badgeTone === "green" && "bg-trading-green text-black"
                      )}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/10 p-3">
        <div className="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Platforms
        </div>
        <div className="space-y-1">
          {platformPlugins.map((platform) => (
            <div
              key={platform.name}
              className={cn(
                "flex items-center gap-3 rounded-md border border-transparent px-3 py-2",
                platform.connected ? "bg-trading-green/5" : "opacity-50"
              )}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-md font-display text-xs font-bold"
                style={{ backgroundColor: `${platform.color}22`, color: platform.color }}
              >
                {platform.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium">{platform.name}</div>
                <div className="truncate text-[10px] text-muted-foreground">{platform.meta}</div>
              </div>
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  platform.connected ? "bg-trading-green shadow-[0_0_8px_#00e5a0]" : "bg-muted-foreground"
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
