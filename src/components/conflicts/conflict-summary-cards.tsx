import { AlertTriangle, CalendarDays, Flame, Info, Users, Waves } from "lucide-react";

import type { ConflictViewModel } from "@/features/conflicts/types";

type ConflictSummaryCardsProps = {
  summary: ConflictViewModel["summary"];
};

const cards = [
  {
    key: "totalConflicts",
    label: "Total conflicts",
    icon: AlertTriangle,
  },
  {
    key: "seriousConflicts",
    label: "Serious conflicts",
    icon: Flame,
  },
  {
    key: "mildConflicts",
    label: "Mild conflicts",
    icon: Waves,
  },
  {
    key: "warningConflicts",
    label: "Warning conflicts",
    icon: Info,
  },
  {
    key: "studentsAffected",
    label: "Students affected",
    icon: Users,
  },
  {
    key: "highRiskDates",
    label: "High-risk dates",
    icon: CalendarDays,
  },
] as const;

export function ConflictSummaryCards({ summary }: ConflictSummaryCardsProps) {
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
