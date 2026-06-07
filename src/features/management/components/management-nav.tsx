"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Crown, KeyRound, LayoutGrid, Shield, Users, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Overview", href: "/management", icon: LayoutGrid },
  { label: "Users", href: "/management/users", icon: Users },
  { label: "API Users", href: "/management/api-users", icon: KeyRound },
  { label: "IP Whitelist", href: "/management/ip-whitelist", icon: Shield },
  { label: "Brands", href: "/management/brands", icon: Crown },
  { label: "Desks", href: "/management/desks", icon: Building2 },
  { label: "Permission Groups", href: "/management/permission-groups", icon: UsersRound }
];

export function ManagementNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href as never}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground",
              active && "border-primary/30 bg-primary/10 text-primary"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
