"use client";

import { useMemo, useState } from "react";

import { BulkStudentSelector } from "@/components/notices/bulk-student-selector";
import { NoticeActions } from "@/components/notices/notice-actions";
import { ParentNoticePreview } from "@/components/notices/parent-notice-preview";
import type { NoticeSettings } from "@/features/notice-settings/types";
import type { NoticeStudent } from "@/features/notices/types";
import { buildNoticeText } from "@/features/notices/utils";

type BulkNoticeGeneratorProps = {
  students: NoticeStudent[];
  settings: NoticeSettings;
};

function EmptyBulkState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <section className="rounded-lg border border-dashed bg-card p-8 text-center shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p>
    </section>
  );
}

export function BulkNoticeGenerator({
  students,
  settings,
}: BulkNoticeGeneratorProps) {
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const selectedStudents = useMemo(
    () =>
      selectedStudentIds
        .map((studentId) => students.find((student) => student.id === studentId))
        .filter((student): student is NoticeStudent => Boolean(student)),
    [selectedStudentIds, students],
  );
  const printableStudents = selectedStudents.filter(
    (student) => student.competitionAssignments.length > 0,
  );
  const skippedStudents = selectedStudents.filter(
    (student) => student.competitionAssignments.length === 0,
  );
  const allNoticeText = printableStudents
    .map((student) =>
      buildNoticeText(student, student.competitionAssignments, settings),
    )
    .join("\n\n---\n\n");

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[0.38fr_0.62fr]">
      <div className="flex min-w-0 flex-col gap-4">
        <BulkStudentSelector
          students={students}
          selectedStudentIds={selectedStudentIds}
          onSelectedStudentIdsChange={setSelectedStudentIds}
        />

        {skippedStudents.length > 0 ? (
          <section className="rounded-lg border border-secondary/40 bg-secondary/10 p-4 text-sm shadow-sm">
            <h2 className="font-semibold">Skipped from print preview</h2>
            <p className="mt-1 leading-6">
              These selected students do not have registered competitions yet:
            </p>
            <p className="mt-2 leading-6">
              {skippedStudents.map((student) => student.name).join(", ")}
            </p>
          </section>
        ) : null}

        <NoticeActions
          noticeText={allNoticeText}
          disabled={printableStudents.length === 0}
          copyLabel="Copy all notice text"
          printLabel="Print selected notices"
        />
      </div>

      {selectedStudents.length === 0 ? (
        <EmptyBulkState
          title="No students selected"
          message="Select one or more students with competition registrations to generate bulk parent notices."
        />
      ) : printableStudents.length === 0 ? (
        <EmptyBulkState
          title="Selected students have no registered competitions"
          message="Register students under competitions first, then return here to print notices."
        />
      ) : (
        <div className="notice-print-scope flex min-w-0 flex-col gap-6">
          {printableStudents.map((student) => (
            <ParentNoticePreview
              key={student.id}
              student={student}
              assignments={student.competitionAssignments}
              settings={settings}
            />
          ))}
        </div>
      )}
    </div>
  );
}
