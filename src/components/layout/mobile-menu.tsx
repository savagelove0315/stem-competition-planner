"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="border-slate-200 bg-white"
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-16 max-h-[calc(100vh-7.5rem)] overflow-y-auto border-b bg-[#071a3a] p-3 text-white shadow-lg">
          <nav className="grid gap-1 sm:grid-cols-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-cyan-50/75 hover:bg-white/10 hover:text-white",
                    isActive &&
                      "bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-500 hover:to-cyan-500 hover:text-white",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
