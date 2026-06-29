"use client";

import { Fragment, useActionState, useState } from "react";
import { Archive, Pencil } from "lucide-react";
import { useFormStatus } from "react-dom";

import { CompetitionForm } from "@/components/competitions/competition-form";
import { Button } from "@/components/ui/button";
import {
  archiveCompetitionAction,
  type CompetitionActionState,
} from "@/features/competitions/actions";
import { cn } from "@/lib/utils";
import type { Competition, CompetitionStatus } from "@/types/database";

type CompetitionListProps = {
  competitions: Competition[];
};

const initialArchiveState: CompetitionActionState = {
  status: "idle",
  message: null,
};

const statusStyles: Record<CompetitionStatus, string> = {
  draft: "border-muted bg-muted text-muted-foreground",
  planned: "border-accent/30 bg-accent/10 text-accent",
  active: "border-primary/30 bg-primary/10 text-primary",
  completed: "border-secondary/40 bg-secondary/15 text-secondary-foreground",
  archived: "border-border bg-background text-muted-foreground",
};

function EmptyMetadata() {
  return <span className="text-muted-foreground">Not set</span>;
}

function ArchiveSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="outline" size="sm" disabled={disabled || pending}>
      <Archive aria-hidden="true" />
      {pending ? "Archiving" : "Archive"}
    </Button>
  );
}

function ArchiveCompetitionForm({ competition }: { competition: Competition }) {
  const [state, formAction] = useActionState(
    archiveCompetitionAction,
    initialArchiveState,
  );
  const isArchived = competition.status === "archived";

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="id" value={competition.id} />
      <ArchiveSubmitButton disabled={isArchived} />
      {state.status === "error" && state.message ? (
        <p className="max-w-48 text-xs text-destructive">{state.message}</p>
      ) : null}
    </form>
  );
}

export function CompetitionList({ competitions }: CompetitionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (competitions.length === 0) {
    return (
      <section className="rounded-lg border border-dashed bg-card p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold">No competitions yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No competitions yet. Add your first competition to start planning.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold">Competition records</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Names and statuses are loaded from Supabase for the signed-in session.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b bg-muted/60 text-xs uppercase tracking-normal text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Short name</th>
              <th className="px-4 py-3 font-medium">Color</th>
              <th className="px-4 py-3 font-medium">Icon</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {competitions.map((competition) => (
              <Fragment key={competition.id}>
                <tr className="align-top">
                  <td className="px-4 py-4">
                    <div className="font-medium">{competition.name}</div>
                    {competition.description ? (
                      <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
                        {competition.description}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    {competition.shortName ? competition.shortName : <EmptyMetadata />}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-4 rounded border"
                        style={{ backgroundColor: competition.color }}
                        aria-hidden="true"
                      />
                      <span className="font-mono text-xs">{competition.color}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {competition.icon ? competition.icon : <EmptyMetadata />}
                  </td>
                  <td className="px-4 py-4">
                    {competition.category ? competition.category : <EmptyMetadata />}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-md border px-2 py-1 text-xs font-medium capitalize",
                        statusStyles[competition.status],
                      )}
                    >
                      {competition.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditingId((current) =>
                            current === competition.id ? null : competition.id,
                          )
                        }
                      >
                        <Pencil aria-hidden="true" />
                        Edit
                      </Button>
                      <ArchiveCompetitionForm competition={competition} />
                    </div>
                  </td>
                </tr>

                {editingId === competition.id ? (
                  <tr>
                    <td className="bg-muted/30 px-4 py-4" colSpan={7}>
                      <CompetitionForm
                        mode="edit"
                        competition={competition}
                        onCancel={() => setEditingId(null)}
                      />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
