"use client";

import { useMemo, useState } from "react";
import { Info } from "lucide-react";

import { NoticeActions } from "@/components/notices/notice-actions";
import { TrainingActivitySelector } from "@/components/notices/training-activity-selector";
import { TrainingNoticePreview } from "@/components/notices/training-notice-preview";
import { Button } from "@/components/ui/button";
import type { NoticeSettings } from "@/features/notice-settings/types";
import type {
  TrainingNoticeActivity,
  TrainingNoticeStudent,
} from "@/features/notices/types";
import {
  buildTrainingNoticeText,
  DEFAULT_TRAINING_WHAT_TO_BRING,
  formatNoticeField,
  formatTrainingNoticeDate,
  formatTrainingNoticeTime,
} from "@/features/notices/utils";

type TrainingNoticeGeneratorProps = {
  activities: TrainingNoticeActivity[];
  settings: NoticeSettings;
};

function EmptyPreviewState({
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

function StudentLine({
  student,
  checked,
  onCheckedChange,
}: {
  student: TrainingNoticeStudent;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const details = [
    student.studentCode,
    student.className ? `Class ${student.className}` : null,
    student.gradeLevel ? `Grade ${student.gradeLevel}` : null,
  ].filter(Boolean);

  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-md border px-3 py-3 transition-colors hover:border-primary/50 hover:bg-primary/5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="mt-1 size-4 rounded border-input text-primary focus-visible:ring-2 focus-visible:ring-ring"
      />
      <span className="min-w-0">
        <span className="block font-medium">{student.name}</span>
        <span className="mt-1 block text-xs text-muted-foreground">
          {details.length > 0 ? details.join(" / ") : "No profile details"}
        </span>
      </span>
    </label>
  );
}

export function TrainingNoticeGenerator({
  activities,
  settings,
}: TrainingNoticeGeneratorProps) {
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [whatToBring, setWhatToBring] = useState("");
  const selectedActivity = useMemo(
    () =>
      activities.find((activity) => activity.id === selectedActivityId) ?? null,
    [activities, selectedActivityId],
  );
  const participants = useMemo(
    () => selectedActivity?.participants ?? [],
    [selectedActivity],
  );
  const selectedStudents = useMemo(
    () =>
      selectedStudentIds
        .map((studentId) =>
          participants.find((participant) => participant.id === studentId),
        )
        .filter((student): student is TrainingNoticeStudent => Boolean(student)),
    [participants, selectedStudentIds],
  );
  const resolvedWhatToBring =
    whatToBring.trim() || DEFAULT_TRAINING_WHAT_TO_BRING;
  const noticeText =
    selectedActivity && selectedStudents.length > 0
      ? selectedStudents
          .map((student) =>
            buildTrainingNoticeText({
              activity: selectedActivity,
              student,
              whatToBring: resolvedWhatToBring,
              teacherDisplayName: settings.teacherDisplayName,
              teacherRoleLabel: settings.teacherRoleLabel,
            }),
          )
          .join("\n\n---\n\n")
      : "";
  const hasPrintableNotices =
    selectedActivity !== null && selectedStudents.length > 0;

  function handleActivityChange(activityId: string) {
    setSelectedActivityId(activityId);
    setSelectedStudentIds([]);
  }

  function handleStudentChecked(studentId: string, checked: boolean) {
    setSelectedStudentIds((current) =>
      checked
        ? [...new Set([...current, studentId])]
        : current.filter((id) => id !== studentId),
    );
  }

  function selectAllParticipants() {
    setSelectedStudentIds(participants.map((participant) => participant.id));
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <section className="notice-print-hidden rounded-lg border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <Info
            className="mt-0.5 size-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div>
            <h2 className="text-sm font-semibold">Training notice source data</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Training notices are generated from activities and assigned
              activity participants. Generated text is not saved.
            </p>
          </div>
        </div>
      </section>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[0.4fr_0.6fr]">
        <div className="notice-print-hidden flex min-w-0 flex-col gap-4">
          <TrainingActivitySelector
            activities={activities}
            selectedActivityId={selectedActivityId}
            onSelectedActivityIdChange={handleActivityChange}
          />

          {selectedActivity ? (
            <section className="rounded-lg border bg-card p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Activity details</h2>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="grid gap-1">
                  <dt className="font-medium text-muted-foreground">
                    Activity name
                  </dt>
                  <dd>{selectedActivity.name}</dd>
                </div>
                <div className="grid gap-1">
                  <dt className="font-medium text-muted-foreground">
                    Competition
                  </dt>
                  <dd>
                    {formatNoticeField(selectedActivity.competition?.name ?? null)}
                  </dd>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="font-medium text-muted-foreground">Date</dt>
                    <dd>{formatTrainingNoticeDate(selectedActivity.startsAt)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">Time</dt>
                    <dd>{formatTrainingNoticeTime(selectedActivity)}</dd>
                  </div>
                </div>
                <div className="grid gap-1">
                  <dt className="font-medium text-muted-foreground">Venue</dt>
                  <dd>{formatNoticeField(selectedActivity.location)}</dd>
                </div>
                <div className="grid gap-1">
                  <dt className="font-medium text-muted-foreground">
                    Participant count
                  </dt>
                  <dd>
                    {participants.length} participant
                    {participants.length === 1 ? "" : "s"}
                  </dd>
                </div>
              </dl>
            </section>
          ) : null}

          {selectedActivity ? (
            <section className="rounded-lg border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Assigned students</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Select one or more participants for generated notices.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllParticipants}
                    disabled={participants.length === 0}
                  >
                    Select all participants
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedStudentIds([])}
                    disabled={selectedStudentIds.length === 0}
                  >
                    Clear selection
                  </Button>
                </div>
              </div>

              {participants.length === 0 ? (
                <p className="mt-4 rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground">
                  No students assigned to this activity yet. Assign participants
                  in Activity Master first.
                </p>
              ) : (
                <div className="mt-4 flex flex-col gap-2">
                  {participants.map((student) => (
                    <StudentLine
                      key={student.id}
                      student={student}
                      checked={selectedStudentIds.includes(student.id)}
                      onCheckedChange={(checked) =>
                        handleStudentChecked(student.id, checked)
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          ) : null}

          <section className="rounded-lg border bg-card p-5 shadow-sm">
            <label className="grid gap-2 text-sm font-medium" htmlFor="what-to-bring">
              <span>What to bring</span>
              <textarea
                id="what-to-bring"
                value={whatToBring}
                onChange={(event) => setWhatToBring(event.target.value)}
                className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm font-normal leading-6 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                placeholder={DEFAULT_TRAINING_WHAT_TO_BRING}
              />
            </label>
          </section>

          <NoticeActions
            noticeText={noticeText}
            disabled={!hasPrintableNotices}
            copyLabel={
              selectedStudents.length > 1
                ? "Copy all training notice text"
                : "Copy training notice text"
            }
            printLabel={
              selectedStudents.length > 1
                ? "Print selected training notices"
                : "Print training notice"
            }
          />
        </div>

        {selectedActivity === null ? (
          <EmptyPreviewState
            title="No training activity selected"
            message="Select a training activity to preview parent notices."
          />
        ) : selectedStudents.length === 0 ? (
          <EmptyPreviewState
            title="No students selected"
            message="Select one or more assigned students to generate training notices."
          />
        ) : (
          <div className="notice-print-scope flex min-w-0 flex-col gap-6">
            {selectedStudents.map((student) => (
              <TrainingNoticePreview
                key={student.id}
                activity={selectedActivity}
                student={student}
                settings={settings}
                whatToBring={resolvedWhatToBring}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
