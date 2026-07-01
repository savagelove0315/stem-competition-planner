"use client";

import { usePathname } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { TopHeader } from "@/components/layout/top-header";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader />
        <main className="min-w-0 flex-1 px-4 pb-24 pt-6 md:px-6 lg:px-8 lg:pb-6 print:p-0">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
