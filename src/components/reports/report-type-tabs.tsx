import Link from "next/link";

import type { ReportFilters, ReportType } from "@/features/reports/types";
import { cn } from "@/lib/utils";

const reportTypes: Array<{ value: ReportType; label: string }> = [
  { value: "competition", label: "Competition" },
  { value: "student-workload", label: "Student Workload" },
  { value: "activity-schedule", label: "Activity Schedule" },
  { value: "conflicts", label: "Conflicts" },
  { value: "class-grade", label: "Class / Grade" },
];

type ReportTypeTabsProps = {
  filters: ReportFilters;
};

export function ReportTypeTabs({ filters }: ReportTypeTabsProps) {
  return (
    <nav
      className="flex min-w-0 gap-2 overflow-x-auto rounded-lg border bg-card p-2 shadow-sm"
      aria-label="Report type"
    >
      {reportTypes.map((reportType) => (
        <Link
          key={reportType.value}
          href={getReportHref(filters, reportType.value)}
          className={cn(
            "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            filters.report === reportType.value && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
          )}
        >
          {reportType.label}
        </Link>
      ))}
    </nav>
  );
}

function getReportHref(filters: ReportFilters, report: ReportType) {
  const params = new URLSearchParams();
  params.set("report", report);
  setParam(params, "month", filters.month);
  setParam(params, "startDate", filters.startDate);
  setParam(params, "endDate", filters.endDate);
  setParam(params, "competitionId", filters.competitionId);
  setParam(params, "gradeLevel", filters.gradeLevel);
  setParam(params, "className", filters.className);
  setParam(params, "activityStatus", filters.activityStatus);

  return `/reports?${params.toString()}`;
}

function setParam(params: URLSearchParams, key: string, value: string | null) {
  if (value) {
    params.set(key, value);
  }
}
