import { requireUser } from "@/lib/auth/require-user";

export default async function TeamsPage() {
  await requireUser("/teams");

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-primary">Coming later</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal md:text-3xl">
            Team Arrangement
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
            Team Arrangement will be added in a later phase. For now, use
            competition rosters and activity participants to manage student
            planning.
          </p>
        </div>
      </div>
    </section>
  );
}
