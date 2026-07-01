import { ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { CompetitionOverview } from "@/features/dashboard/types";

type CompetitionOverviewCardProps = {
  competitions: CompetitionOverview[];
  hasCompetitions: boolean;
};

export function CompetitionOverviewCard({
  competitions,
  hasCompetitions,
}: CompetitionOverviewCardProps) {
  return (
    <section className="min-w-0 rounded-lg border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Competition overview</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Active and planned competitions with current enrollment and activity counts.
        </p>
      </div>

      {competitions.length === 0 ? (
        <div className="p-6">
          <p className="text-sm text-muted-foreground">
            {hasCompetitions
              ? "No active or planned competitions. Check completed or archived records on the competitions page."
              : "No competitions yet. Create a competition first so students, activities, and notices have a shared planning record."}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/competitions">Manage Competitions</Link>
          </Button>
        </div>
      ) : (
        <div className="divide-y">
          {competitions.map((competition) => (
            <div key={competition.id} className="grid gap-3 px-5 py-4">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: competition.color }}
                  aria-hidden="true"
                />
                <h3 className="min-w-0 truncate font-medium">
                  {competition.name}
                </h3>
                <span className="rounded-md border bg-muted px-2 py-1 text-xs font-medium capitalize">
                  {competition.status}
                </span>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
                <span>{competition.enrolledStudentCount} enrolled students</span>
                <span>{competition.activityCount} activities</span>
                <span>{competition.upcomingActivityCount} upcoming</span>
                <span>
                  {competition.participantAssignmentCount} participant assignments
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
