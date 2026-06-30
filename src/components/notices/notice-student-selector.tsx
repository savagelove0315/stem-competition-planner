"use client";

import type { NoticeStudent } from "@/features/notices/types";

type NoticeStudentSelectorProps = {
  students: NoticeStudent[];
  selectedStudentId: string;
  onSelectedStudentIdChange: (studentId: string) => void;
};

export function NoticeStudentSelector({
  students,
  selectedStudentId,
  onSelectedStudentIdChange,
}: NoticeStudentSelectorProps) {
  return (
    <section className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="notice-student">
          Student
        </label>
        <select
          id="notice-student"
          value={selectedStudentId}
          onChange={(event) => onSelectedStudentIdChange(event.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Select a student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
              {student.className ? ` (${student.className})` : ""}
            </option>
          ))}
        </select>
        <p className="text-xs leading-5 text-muted-foreground">
          Notices are generated from registered competitions only.
        </p>
      </div>
    </section>
  );
}
