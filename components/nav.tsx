"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, LineChart } from "lucide-react";

import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/theme-switcher";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/portfolio", label: "Portfolio", icon: LineChart },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4">
        <span className="font-heading text-sm font-semibold">
          Wealth Tracker
        </span>
        <div className="flex items-center gap-5">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 text-sm transition-colors hover:text-foreground",
                  isActive ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {link.label}
              </Link>
            );
          })}
        </div>
        <ThemeSwitcher />
      </div>
    </header>
  );
}
