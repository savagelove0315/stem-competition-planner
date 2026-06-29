"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/components/layout/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b px-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            SP
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">STEM Planner</p>
            <p className="truncate text-xs text-muted-foreground">
              Competition operations
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
