import { BarChart3 } from "lucide-react";

import type { ReportSummaryCard } from "@/features/reports/types";

export function ReportSummaryCards({
  summaryCards,
}: {
  summaryCards: ReportSummaryCard[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {summaryCards.map((card) => (
        <div key={card.label} className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">{card.label}</div>
            <BarChart3 className="size-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-normal">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
