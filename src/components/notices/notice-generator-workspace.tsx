"use client";

import { useState } from "react";

import { ParentNoticeGenerator } from "@/components/notices/parent-notice-generator";
import { TrainingNoticeGenerator } from "@/components/notices/training-notice-generator";
import type { NoticeSettings } from "@/features/notice-settings/types";
import type {
  NoticeStudent,
  TrainingNoticeActivity,
} from "@/features/notices/types";
import { cn } from "@/lib/utils";

type NoticeGeneratorWorkspaceProps = {
  students: NoticeStudent[];
  trainingActivities: TrainingNoticeActivity[];
  settings: NoticeSettings;
};

type NoticeType = "competition" | "training";

const noticeTypes: Array<{
  value: NoticeType;
  label: string;
  description: string;
}> = [
  {
    value: "competition",
    label: "Competition Notice",
    description: "Uses student competition registrations.",
  },
  {
    value: "training",
    label: "Training Notice",
    description: "Uses activities and assigned participants.",
  },
];

export function NoticeGeneratorWorkspace({
  students,
  trainingActivities,
  settings,
}: NoticeGeneratorWorkspaceProps) {
  const [noticeType, setNoticeType] = useState<NoticeType>("competition");

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="notice-print-hidden grid gap-2 rounded-lg border bg-card p-2 shadow-sm md:grid-cols-2">
        {noticeTypes.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => setNoticeType(type.value)}
            className={cn(
              "rounded-md px-4 py-3 text-left transition-colors hover:bg-muted",
              noticeType === type.value && "bg-primary text-primary-foreground",
            )}
          >
            <span className="block text-sm font-semibold">{type.label}</span>
            <span
              className={cn(
                "mt-1 block text-xs leading-5 text-muted-foreground",
                noticeType === type.value && "text-primary-foreground/80",
              )}
            >
              {type.description}
            </span>
          </button>
        ))}
      </div>

      {noticeType === "competition" ? (
        <ParentNoticeGenerator students={students} settings={settings} />
      ) : (
        <TrainingNoticeGenerator
          activities={trainingActivities}
          settings={settings}
        />
      )}
    </div>
  );
}
