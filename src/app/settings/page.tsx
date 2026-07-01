import Link from "next/link";
import { Bell, SlidersHorizontal, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/require-user";

const futureSettings = [
  {
    title: "App Preferences",
    description: "Personal defaults for planner views and display options.",
    icon: SlidersHorizontal,
  },
  {
    title: "User Roles",
    description: "Role management for future multi-user workflows.",
    icon: UserCog,
  },
] as const;

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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <section className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-primary/10 text-primary">
              <Bell className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-primary">Available</p>
              <h2 className="mt-1 text-lg font-semibold">
                Parent Notice Settings
              </h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Configure teacher name, notice wording, and footer text.
          </p>
          <Button asChild className="mt-4">
            <Link href="/settings/notices">Open Parent Notice Settings</Link>
          </Button>
        </section>

        {futureSettings.map((setting) => {
          const Icon = setting.icon;

          return (
            <section
              key={setting.title}
              className="rounded-lg border bg-card/70 p-5 text-muted-foreground shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-medium">Coming soon</p>
                  <h2 className="mt-1 text-lg font-semibold text-foreground">
                    {setting.title}
                  </h2>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6">{setting.description}</p>
            </section>
          );
        })}
      </div>
    </section>
  );
}
