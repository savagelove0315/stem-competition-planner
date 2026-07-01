import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  GraduationCap,
  ListChecks,
  Mail,
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
  {
    label: "Generate Notices",
    href: "/notices",
    icon: Mail,
  },
] as const;

const workflowSteps = [
  "Create competitions",
  "Register students",
  "Create activities",
  "Assign participants",
  "Check timeline",
  "Review conflicts",
  "Generate notices",
] as const;

export function DashboardShortcuts() {
  return (
    <section className="grid gap-4 rounded-lg border bg-card p-5 shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <h2 className="text-lg font-semibold">Navigation shortcuts</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Jump to the daily planning pages teachers use most often.
        </p>
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
      </div>

      <div className="rounded-md border bg-background p-4">
        <h3 className="text-sm font-semibold">Getting started workflow</h3>
        <ol className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          {workflowSteps.map((step, index) => (
            <li key={step} className="flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md border bg-muted text-xs font-semibold text-foreground">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
