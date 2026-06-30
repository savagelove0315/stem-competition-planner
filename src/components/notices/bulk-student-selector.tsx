"use client";

import { useState } from "react";

import type {
  NoticeStudent,
  NoticeStudentFilters,
} from "@/features/notices/types";
import { filterNoticeStudents } from "@/features/notices/utils";

type BulkStudentSelectorProps = {
  students: NoticeStudent[];
  selectedStudentIds: string[];
  onSelectedStudentIdsChange: (studentIds: string[]) => void;
};

function uniqueSorted(values: Array<string | null>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))]
    .sort((a, b) => a.localeCompare(b));
}

export function BulkStudentSelector({
  students,
  selectedStudentIds,
  onSelectedStudentIdsChange,
}: BulkStudentSelectorProps) {
  const [filters, setFilters] = useState<NoticeStudentFilters>({
    className: "",
    gradeLevel: "",
    competitionId: "",
    onlyWithCompetitions: false,
    onlyMultiCompetition: false,
  });
  const classes = uniqueSorted(students.map((student) => student.className));
  const grades = uniqueSorted(students.map((student) => student.gradeLevel));
  const competitionOptions = [
    ...new Map(
      students.flatMap((student) =>
        student.competitionAssignments.map((assignment) => [
          assignment.competition.id,
          assignment.competition.name,
        ]),
      ),
    ).entries(),
  ].sort((a, b) => a[1].localeCompare(b[1]));
  const visibleStudents = filterNoticeStudents(students, filters);
  const visibleStudentIds = visibleStudents.map((student) => student.id);
  const selectedVisibleCount = visibleStudentIds.filter((id) =>
    selectedStudentIds.includes(id),
  ).length;

  function toggleStudent(studentId: string) {
    onSelectedStudentIdsChange(
      selectedStudentIds.includes(studentId)
        ? selectedStudentIds.filter((id) => id !== studentId)
        : [...selectedStudentIds, studentId],
    );
  }

  function selectAllVisible() {
    onSelectedStudentIdsChange([
      ...new Set([...selectedStudentIds, ...visibleStudentIds]),
    ]);
  }

  return (
    <section className="rounded-lg border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Bulk student selection</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Select active students, then preview or print one notice per student.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="bulk-class-filter">
            Class
          </label>
          <select
            id="bulk-class-filter"
            value={filters.className}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                className: event.target.value,
              }))
            }
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All classes</option>
            {classes.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="bulk-grade-filter">
            Grade
          </label>
          <select
            id="bulk-grade-filter"
            value={filters.gradeLevel}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                gradeLevel: event.target.value,
              }))
            }
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All grades</option>
            {grades.map((gradeLevel) => (
              <option key={gradeLevel} value={gradeLevel}>
                {gradeLevel}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2 md:col-span-2">
          <label
            className="text-sm font-medium"
            htmlFor="bulk-competition-filter"
          >
            Competition
          </label>
          <select
            id="bulk-competition-filter"
            value={filters.competitionId}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                competitionId: event.target.value,
              }))
            }
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All competitions</option>
            {competitionOptions.map(([competitionId, competitionName]) => (
              <option key={competitionId} value={competitionId}>
                {competitionName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.onlyWithCompetitions}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                onlyWithCompetitions: event.target.checked,
              }))
            }
            className="mt-1"
          />
          <span>Only students with registered competitions</span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.onlyMultiCompetition}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                onlyMultiCompetition: event.target.checked,
              }))
            }
            className="mt-1"
          />
          <span>Only multi-competition students</span>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={selectAllVisible}
          className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          disabled={visibleStudents.length === 0}
        >
          Select all visible students
        </button>
        <button
          type="button"
          onClick={() => onSelectedStudentIdsChange([])}
          className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          disabled={selectedStudentIds.length === 0}
        >
          Clear selection
        </button>
        <p className="text-sm text-muted-foreground">
          {selectedStudentIds.length} selected, {selectedVisibleCount} visible
        </p>
      </div>

      <div className="mt-5 max-h-[28rem] overflow-y-auto rounded-md border">
        {students.length === 0 ? (
          <div className="p-5 text-sm text-muted-foreground">
            No students found.
          </div>
        ) : visibleStudents.length === 0 ? (
          <div className="p-5 text-sm text-muted-foreground">
            No students match the current filters.
          </div>
        ) : (
          <div className="divide-y">
            {visibleStudents.map((student) => (
              <label
                key={student.id}
                className="flex cursor-pointer items-start gap-3 p-3 text-sm hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  checked={selectedStudentIds.includes(student.id)}
                  onChange={() => toggleStudent(student.id)}
                  className="mt-1"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{student.name}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {[student.className, student.gradeLevel]
                      .filter(Boolean)
                      .join(" / ") || "No class or grade set"}
                    {" - "}
                    {student.competitionAssignments.length} registered
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
