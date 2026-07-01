import { NoticeSettingsForm } from "@/components/settings/notice-settings-form";
import { getNoticeSettings } from "@/features/notice-settings/queries";
import { requireUser } from "@/lib/auth/require-user";

export default async function NoticeSettingsPage() {
  await requireUser("/settings/notices");
  const settings = await getNoticeSettings();

  return (
    <section className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-primary">Settings</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal md:text-3xl">
            Parent Notice Settings
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
            Configure the default wording and teacher information used by the
            Parent Notice Generator. Notice content is generated from
            competition registrations; no generated notices are saved here.
          </p>
        </div>
      </div>

      <NoticeSettingsForm settings={settings} />
    </section>
  );
}
