import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/require-user";

export default async function SettingsPage() {
  await requireUser("/settings");

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-primary">Administration</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal md:text-3xl">
            Settings
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
            Configure app-level preferences and defaults used by planner
            workflows.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-primary">Notices</p>
          <h2 className="mt-2 text-lg font-semibold">Parent Notice Settings</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Edit default notice wording, teacher display name, signature role,
            and footer text.
          </p>
          <Button asChild className="mt-4">
            <Link href="/settings/notices">Open Notice Settings</Link>
          </Button>
        </section>
      </div>
    </section>
  );
}
