"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Fuel, Car, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/history", label: "Histórico", icon: Fuel },
  { href: "/vehicles", label: "Veículos", icon: Car },
  { href: "/configuracao", label: "Config", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors",
                isActive
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn("h-[22px] w-[22px]", isActive && "stroke-[2.5]")}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
