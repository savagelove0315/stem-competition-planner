"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Atom } from "lucide-react";

import { navigationItems } from "@/components/layout/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#071a3a] text-white shadow-xl lg:flex lg:flex-col">
      <div className="flex h-20 items-center border-b border-white/10 px-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
            <Atom className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">STEM Planner</p>
            <p className="truncate text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-100/65">
              Command centre
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-cyan-50/75 transition-colors hover:bg-white/10 hover:text-white",
                isActive &&
                  "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm hover:from-teal-500 hover:to-cyan-500 hover:text-white",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </nav>
      <div className="m-4 rounded-lg border border-white/10 bg-white/5 p-4 text-xs text-cyan-50/75">
        <p className="font-medium text-white">Planning status</p>
        <p className="mt-1 leading-5">Use conflicts and timeline to keep schedules balanced.</p>
      </div>
    </aside>
  );
}
