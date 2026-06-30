import { AlertCircle, AlertTriangle, CheckCircle2, Eye, RotateCcw } from "lucide-react";

import type { ConflictViewModel } from "@/features/conflicts/types";

type ConflictSummaryCardsProps = {
  summary: ConflictViewModel["summary"];
};

const cards = [
  {
    key: "totalDetectedConflicts",
    label: "Total detected",
    icon: AlertTriangle,
  },
  {
    key: "unreviewedConflicts",
    label: "Unreviewed",
    icon: RotateCcw,
  },
  {
    key: "reviewedConflicts",
    label: "Reviewed",
    icon: Eye,
  },
  {
    key: "resolvedConflicts",
    label: "Resolved",
    icon: CheckCircle2,
  },
  {
    key: "seriousUnresolvedConflicts",
    label: "Serious unresolved",
    icon: AlertCircle,
  },
] as const;

export function ConflictSummaryCards({ summary }: ConflictSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
