import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  Users,
  UserRoundCheck,
} from "lucide-react";

import type { DashboardSummary } from "@/features/dashboard/types";

type DashboardSummaryCardsProps = {
  summary: DashboardSummary;
};

const cards = [
  {
    key: "activeCompetitions",
    label: "Active competitions",
    icon: ShieldCheck,
  },
  {
    key: "activeStudents",
    label: "Active students",
    icon: Users,
  },
  {
    key: "upcomingActivities",
    label: "Upcoming activities",
    icon: Activity,
  },
  {
    key: "multiCompetitionStudents",
    label: "Multi-competition students",
    icon: UserRoundCheck,
  },
  {
    key: "unresolvedConflicts",
    label: "Unresolved conflicts",
    icon: AlertTriangle,
  },
  {
    key: "seriousUnresolvedConflicts",
    label: "Serious unresolved",
    icon: AlertCircle,
  },
] as const;

export function DashboardSummaryCards({ summary }: DashboardSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div key={card.key} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">{card.label}</div>
              <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-normal">
              {summary[card.key]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
