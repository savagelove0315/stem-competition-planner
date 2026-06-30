import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  GraduationCap,
  ListChecks,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const shortcuts = [
  {
    label: "Manage Competitions",
    href: "/competitions",
    icon: ShieldCheck,
  },
  {
    label: "Manage Students",
    href: "/students",
    icon: GraduationCap,
  },
  {
    label: "Manage Activities",
    href: "/activities",
    icon: Activity,
  },
  {
    label: "View Student Timeline",
    href: "/student-timeline",
    icon: ListChecks,
  },
  {
    label: "Review Conflicts",
    href: "/conflicts",
    icon: AlertTriangle,
  },
] as const;

export function DashboardShortcuts() {
  return (
    <section className="rounded-lg border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Navigation shortcuts</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon;

          return (
            <Button key={shortcut.href} asChild variant="outline" size="sm">
              <Link href={shortcut.href}>
                <Icon aria-hidden="true" />
                {shortcut.label}
              </Link>
            </Button>
          );
        })}
      </div>
    </section>
  );
}
