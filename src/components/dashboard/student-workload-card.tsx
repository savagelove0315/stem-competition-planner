import { UserRoundCheck } from "lucide-react";

import type { StudentWorkloadOverview } from "@/features/dashboard/types";

type StudentWorkloadCardProps = {
  students: StudentWorkloadOverview[];
  hasStudents: boolean;
};

export function StudentWorkloadCard({
  students,
  hasStudents,
}: StudentWorkloadCardProps) {
  return (
    <section className="min-w-0 rounded-lg border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <UserRoundCheck className="size-5 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Student workload</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Students registered in multiple competitions or assigned to many upcoming activities.
        </p>
      </div>

      {students.length === 0 ? (
        <div className="p-6 text-sm text-muted-foreground">
          {hasStudents
            ? "No high-involvement students yet."
            : "No students registered yet."}
        </div>
      ) : (
        <div className="divide-y">
          {students.map((student) => (
            <div key={student.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto]">
              <div className="min-w-0">
                <h3 className="truncate font-medium">{student.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {student.className ?? "Class not set"} -{" "}
                  {student.gradeLevel ?? "Grade not set"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-md border bg-muted px-2 py-1 font-medium">
                  {student.competitionCount} competitions
                </span>
                <span className="rounded-md border bg-muted px-2 py-1 font-medium">
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
