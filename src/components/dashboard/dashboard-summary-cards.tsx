import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  Users,
  UserRoundCheck,
} from "lucide-react";

import type { DashboardSummary } from "@/features/dashboard/types";
import { cn } from "@/lib/utils";

type DashboardSummaryCardsProps = {
  summary: DashboardSummary;
};

const cards = [
  {
    key: "activeCompetitions",
    label: "Active competitions",
    helper: "Currently running competitions",
    icon: ShieldCheck,
    accent: "text-teal-700 bg-teal-500/10 border-teal-500/20",
    glow: "from-teal-500/12",
  },
  {
    key: "activeStudents",
    label: "Active students",
    helper: "Learners available for planning",
    icon: Users,
    accent: "text-blue-700 bg-blue-500/10 border-blue-500/20",
    glow: "from-blue-500/12",
  },
  {
    key: "upcomingActivities",
    label: "Upcoming activities",
    helper: "Future scheduled activities",
    icon: Activity,
    accent: "text-violet-700 bg-violet-500/10 border-violet-500/20",
    glow: "from-violet-500/12",
  },
  {
    key: "multiCompetitionStudents",
    label: "Multi-competition students",
    helper: "Students enrolled in 2+ competitions",
    icon: UserRoundCheck,
    accent: "text-amber-700 bg-amber-500/10 border-amber-500/20",
    glow: "from-amber-500/12",
  },
  {
    key: "unresolvedConflicts",
    label: "Unresolved conflicts",
    helper: "Open schedule or constraint risks",
    icon: AlertTriangle,
    accent: "text-rose-700 bg-rose-500/10 border-rose-500/20",
    glow: "from-rose-500/12",
  },
  {
    key: "seriousUnresolvedConflicts",
    label: "Serious unresolved",
    helper: "High-priority unresolved risks",
    icon: AlertCircle,
    accent: "text-red-700 bg-red-500/10 border-red-500/20",
    glow: "from-red-500/12",
  },
] as const;

export function DashboardSummaryCards({ summary }: DashboardSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.key}
            className="relative min-h-24 overflow-hidden rounded-lg border bg-card p-3 shadow-sm"
          >
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t to-transparent",
                card.glow,
              )}
              aria-hidden="true"
            />
            <div className="relative flex items-start gap-2.5">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-md border",
                  card.accent,
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="text-xs font-medium leading-4 text-foreground sm:text-sm">
                  {card.label}
                </div>
                <p className="mt-0.5 hidden text-xs leading-4 text-muted-foreground sm:block">
                  {card.helper}
                </p>
              </div>
            </div>
            <div className="relative mt-2 text-2xl font-semibold leading-none tracking-normal text-slate-950">
              {summary[card.key]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
