import { UserRoundCheck } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { StudentWorkloadOverview } from "@/features/dashboard/types";

type StudentWorkloadCardProps = {
  students: StudentWorkloadOverview[];
  hasStudents: boolean;
};

function getInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "ST";
}

export function StudentWorkloadCard({
  students,
  hasStudents,
}: StudentWorkloadCardProps) {
  return (
    <section className="min-w-0 rounded-lg border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-md border border-teal-500/20 bg-teal-500/10 text-teal-700">
            <UserRoundCheck className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Student workload</h2>
            <p className="text-sm text-muted-foreground">
              High-involvement students from current registrations and activities.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/students">View all</Link>
        </Button>
      </div>

      {students.length === 0 ? (
        <div className="p-6">
          <p className="text-sm text-muted-foreground">
            {hasStudents
              ? "No high-involvement students yet. Register students under competitions and assign activities to build workload data."
              : "No students yet. Add students or register them under competitions to begin workload tracking."}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/students">Manage Students</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 p-4">
          {students.map((student) => (
            <div
              key={student.id}
              className="grid gap-3 rounded-lg border bg-gradient-to-r from-white to-slate-50 p-3 sm:grid-cols-[1fr_auto]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-900 text-sm font-semibold text-white">
                  {getInitials(student.name)}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{student.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {student.className ?? "Class not set"} -{" "}
                    {student.gradeLevel ?? "Grade not set"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-md border border-violet-500/20 bg-violet-500/10 px-2 py-1 font-medium text-violet-700">
                  {student.competitionCount} competitions
                </span>
                <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1 font-medium text-amber-700">
                  {student.upcomingActivityCount} upcoming activities
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
