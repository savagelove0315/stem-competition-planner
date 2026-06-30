import Link from "next/link";
import { Rows3, Table2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  TimelineFilters,
  TimelineViewMode,
} from "@/features/timeline/types";
import { buildTimelineViewHref } from "@/features/timeline/utils";
import { cn } from "@/lib/utils";

type TimelineViewToggleProps = {
  filters: TimelineFilters;
};

const options: Array<{
  value: TimelineViewMode;
  label: string;
  icon: typeof Rows3;
}> = [
  {
    value: "competition",
    label: "Competition View",
    icon: Rows3,
  },
  {
    value: "activity",
    label: "Activity View",
    icon: Table2,
  },
];

export function TimelineViewToggle({ filters }: TimelineViewToggleProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold">Timeline Grid</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This overview shows activity schedules across competitions. Student-level
          clashes are handled in Conflict Detection.
        </p>
      </div>
      <div className="flex rounded-lg border bg-card p-1 shadow-sm">
        {options.map((option) => {
          const Icon = option.icon;
          const isActive = filters.view === option.value;

          return (
            <Button
              key={option.value}
              type="button"
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                "rounded-md",
                isActive ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "",
              )}
            >
              <Link href={buildTimelineViewHref(filters, option.value)}>
                <Icon aria-hidden="true" />
                {option.label}
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
