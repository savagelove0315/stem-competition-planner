"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { navigationItems } from "@/components/layout/navigation";

export function TopHeader() {
  const pathname = usePathname();
  const currentPage =
    navigationItems.find((item) => item.href === pathname)?.title ?? "Dashboard";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white/90 px-4 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <MobileMenu />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted-foreground">
            Welcome back
          </p>
          <h1 className="truncate text-xl font-semibold">{currentPage}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button asChild size="sm" className="hidden bg-teal-600 hover:bg-teal-700 sm:inline-flex">
          <Link href="/competitions">
            <Plus aria-hidden="true" />
            New Competition
          </Link>
        </Button>
        <LogoutButton />
      </div>
    </header>
  );
}
