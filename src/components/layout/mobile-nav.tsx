"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/components/layout/navigation";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="grid grid-cols-5 border-t bg-card lg:hidden">
      {navigationItems.slice(0, 5).map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground",
              isActive && "text-primary",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span className="max-w-full truncate px-1">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
