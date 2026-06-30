import type { WorkloadLevel } from "@/features/reports/types";
import { cn } from "@/lib/utils";

export function EmptyValue() {
  return <span className="text-muted-foreground">Not set</span>;
}

export function CompetitionBadge({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <span
      className="inline-flex max-w-52 items-center gap-2 rounded-md border px-2 py-1 text-xs font-medium"
      style={{ borderColor: color, backgroundColor: `${color}1A` }}
    >
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="truncate">{label}</span>
    </span>
  );
}

export function StatusBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex rounded-md border bg-muted px-2 py-1 text-xs font-medium capitalize text-muted-foreground">
      {value.replace("-", " ")}
    </span>
  );
}

export function WorkloadBadge({ level }: { level: WorkloadLevel }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-1 text-xs font-medium capitalize",
        level === "high risk" &&
          "border-destructive/30 bg-destructive/10 text-destructive",
        level === "busy" && "border-amber-500/40 bg-amber-500/10 text-amber-700",
        level === "normal" &&
          "border-emerald-600/40 bg-emerald-600/10 text-emerald-700",
      )}
    >
      {level}
    </span>
  );
}

export function ReportEmptyState() {
  return (
    <section className="rounded-lg border border-dashed bg-card p-8 text-center shadow-sm">
      <h2 className="text-lg font-semibold">No report data</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        No report data found for the selected filters.
      </p>
    </section>
  );
}
