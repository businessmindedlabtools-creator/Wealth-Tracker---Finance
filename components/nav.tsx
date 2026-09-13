"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/portfolio", label: "Portfolio" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-4xl items-center gap-6 px-4 py-4">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
