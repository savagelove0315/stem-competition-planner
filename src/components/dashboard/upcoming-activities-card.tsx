import { CalendarClock } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { UpcomingActivityOverview } from "@/features/dashboard/types";

type UpcomingActivitiesCardProps = {
  activities: UpcomingActivityOverview[];
  hasActivities: boolean;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function CompetitionBadge({ activity }: { activity: UpcomingActivityOverview }) {
  const competition = activity.competition;
  const color = competition?.color ?? "#64748b";
  const label = competition?.shortName ?? competition?.name ?? "Competition";

  return (
    <span
      className="inline-flex max-w-44 items-center gap-2 rounded-md border px-2 py-1 text-xs font-medium"
      style={{ borderColor: color, backgroundColor: `${color}1A` }}
    >
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="truncate">{label}</span>
    </span>
  );
}

export function UpcomingActivitiesCard({
  activities,
  hasActivities,
}: UpcomingActivitiesCardProps) {
  return (
    <section className="min-w-0 rounded-lg border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="size-5 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Upcoming activities</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Next scheduled activities with participant counts.
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="p-6">
          <p className="text-sm text-muted-foreground">
            {hasActivities
              ? "No upcoming activities with a future start date. Check Activity Master for unscheduled or completed records."
              : "No activities yet. Create activities after setting up competitions."}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/activities">Manage Activities</Link>
          </Button>
        </div>
      ) : (
        <div className="divide-y">
          {activities.map((activity) => (
            <div key={activity.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[1fr_auto]">
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h3 className="min-w-0 truncate font-medium">{activity.name}</h3>
                  <CompetitionBadge activity={activity} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDateTime(activity.startsAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-md border bg-muted px-2 py-1 font-medium capitalize">
                  {activity.status}
                </span>
                <span className="rounded-md border bg-muted px-2 py-1 font-medium">
                  {activity.participantCount} participants
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
