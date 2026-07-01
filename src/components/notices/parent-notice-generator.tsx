"use client";

import { useMemo, useState } from "react";
import { Info } from "lucide-react";

import { BulkNoticeGenerator } from "@/components/notices/bulk-notice-generator";
import { NoticeActions } from "@/components/notices/notice-actions";
import { NoticeStudentSelector } from "@/components/notices/notice-student-selector";
import { ParentNoticePreview } from "@/components/notices/parent-notice-preview";
import type { CompetitionNoticeSettings } from "@/features/notice-settings/types";
import type { NoticeStudent } from "@/features/notices/types";
import { buildNoticeText } from "@/features/notices/utils";

type ParentNoticeGeneratorProps = {
  students: NoticeStudent[];
  settings: CompetitionNoticeSettings;
};

type NoticeMode = "single" | "bulk";

export function ParentNoticeGenerator({
  students,
  settings,
}: ParentNoticeGeneratorProps) {
  const [mode, setMode] = useState<NoticeMode>("single");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) ?? null,
    [selectedStudentId, students],
  );
  const assignments = selectedStudent?.competitionAssignments ?? [];
  const noticeText = selectedStudent
    ? buildNoticeText(selectedStudent, assignments, settings)
    : "";
  const hasPrintableNotice = selectedStudent !== null && assignments.length > 0;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <section className="notice-print-hidden rounded-lg border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-semibold">Notice source data</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Notices are generated from competition registrations. Register
              students under competitions before generating single or bulk
              notices.
            </p>
          </div>
        </div>
      </section>

      <div className="notice-print-hidden flex flex-wrap gap-2 rounded-lg border bg-card p-2 shadow-sm">
        <button
          type="button"
          onClick={() => setMode("single")}
          className={
            mode === "single"
              ? "inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
              : "inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          }
        >
          Single Student Notice
        </button>
        <button
          type="button"
          onClick={() => setMode("bulk")}
          className={
            mode === "bulk"
              ? "inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
              : "inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          }
        >
          Bulk Notices
        </button>
      </div>

      {mode === "single" ? (
        <div className="grid min-w-0 gap-6 xl:grid-cols-[0.35fr_0.65fr]">
          <div className="flex min-w-0 flex-col gap-4">
            <NoticeStudentSelector
              students={students}
              selectedStudentId={selectedStudentId}
              onSelectedStudentIdChange={setSelectedStudentId}
            />
            <NoticeActions
              noticeText={noticeText}
              disabled={!hasPrintableNotice}
            />
          </div>

          <div className="notice-print-scope">
            <ParentNoticePreview
              student={selectedStudent}
              assignments={assignments}
              settings={settings}
            />
          </div>
        </div>
      ) : (
        <BulkNoticeGenerator students={students} settings={settings} />
      )}
    </div>
  );
}
