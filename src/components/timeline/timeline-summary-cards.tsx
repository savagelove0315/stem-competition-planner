import { Activity, CalendarDays, ShieldCheck, Users } from "lucide-react";

import type { TimelineViewModel } from "@/features/timeline/types";

type TimelineSummaryCardsProps = {
  summary: TimelineViewModel["summary"];
};

const cards = [
  {
    key: "competitionsShown",
    label: "Competitions shown",
    icon: ShieldCheck,
  },
  {
    key: "activitiesShown",
    label: "Activities shown",
    icon: Activity,
  },
  {
    key: "upcomingActivities",
    label: "Upcoming activities",
    icon: CalendarDays,
  },
  {
    key: "participantAssignments",
    label: "Participant assignments",
    icon: Users,
  },
] as const;

export function TimelineSummaryCards({ summary }: TimelineSummaryCardsProps) {
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

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="text-sm text-muted-foreground">Date range</div>
        <div className="mt-2 text-lg font-semibold tracking-normal">
          {summary.dateRangeLabel}
        </div>
      </div>
    </div>
  );
}
