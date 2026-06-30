"use client";

import { useMemo, useState } from "react";

import { NoticeActions } from "@/components/notices/notice-actions";
import { NoticeStudentSelector } from "@/components/notices/notice-student-selector";
import { ParentNoticePreview } from "@/components/notices/parent-notice-preview";
import type { NoticeStudent } from "@/features/notices/types";
import { buildNoticeText } from "@/features/notices/utils";

type ParentNoticeGeneratorProps = {
  students: NoticeStudent[];
};

export function ParentNoticeGenerator({ students }: ParentNoticeGeneratorProps) {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) ?? null,
    [selectedStudentId, students],
  );
  const assignments = selectedStudent?.competitionAssignments ?? [];
  const noticeText = selectedStudent
    ? buildNoticeText(selectedStudent, assignments)
    : "";
  const hasPrintableNotice = selectedStudent !== null && assignments.length > 0;

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[0.35fr_0.65fr]">
      <div className="flex min-w-0 flex-col gap-4">
        <NoticeStudentSelector
          students={students}
          selectedStudentId={selectedStudentId}
          onSelectedStudentIdChange={setSelectedStudentId}
        />
        <NoticeActions noticeText={noticeText} disabled={!hasPrintableNotice} />
      </div>

      <ParentNoticePreview student={selectedStudent} assignments={assignments} />
    </div>
  );
}
