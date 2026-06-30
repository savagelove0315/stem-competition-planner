import { ConflictFilters } from "@/components/conflicts/conflict-filters";
import { ConflictSummaryCards } from "@/components/conflicts/conflict-summary-cards";
import { ConflictTable } from "@/components/conflicts/conflict-table";
import { getConflictDetectionData } from "@/features/conflicts/queries";
import {
  buildConflictViewModel,
  parseConflictFilters,
} from "@/features/conflicts/utils";

type ConflictsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function ExplanationPanel({ bufferMinutes }: { bufferMinutes: number }) {
  return (
    <section className="rounded-lg border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">How conflicts are classified</h2>
      <div className="mt-4 grid gap-4 text-sm leading-6 text-muted-foreground md:grid-cols-3">
        <div>
          <div className="font-medium text-foreground">Serious</div>
          <p>Time overlap for the same student on the same schedule date.</p>
        </div>
        <div>
          <div className="font-medium text-foreground">Mild</div>
          <p>
            Same-day activities with less than a {bufferMinutes}-minute gap.
          </p>
        </div>
        <div>
          <div className="font-medium text-foreground">Warning</div>
          <p>
            Incomplete time data or same-day/date-range schedule risk that needs
            human review.
          </p>
        </div>
      </div>
    </section>
  );
}

export default async function ConflictsPage({ searchParams }: ConflictsPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = parseConflictFilters(resolvedSearchParams);
  const conflictData = await getConflictDetectionData();
  const viewModel = buildConflictViewModel({
    ...conflictData,
    filters,
  });

  return (
    <section className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-primary">Planning</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal md:text-3xl">
            Conflict Detection
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
            Review live scheduling conflicts computed from existing student
            activity assignments.
          </p>
        </div>
      </div>

      <ConflictFilters
        filters={filters}
        filterOptions={viewModel.filterOptions}
      />

      <ConflictSummaryCards summary={viewModel.summary} />

      <ExplanationPanel bufferMinutes={viewModel.bufferMinutes} />

      <ConflictTable viewModel={viewModel} />
    </section>
  );
}
