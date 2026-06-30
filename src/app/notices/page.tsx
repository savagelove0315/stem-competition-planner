import { ParentNoticeGenerator } from "@/components/notices/parent-notice-generator";
import { getNoticeSettings } from "@/features/notice-settings/queries";
import { listNoticeStudents } from "@/features/notices/queries";
import { requireUser } from "@/lib/auth/require-user";

export default async function NoticesPage() {
  await requireUser("/notices");

  const [students, settings] = await Promise.all([
    listNoticeStudents(),
    getNoticeSettings({ fallbackOnError: true }),
  ]);

  return (
    <section className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm print:hidden">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-primary">Communication</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal md:text-3xl">
            Parent Notices
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
            Generate a read-only parent notice for one student based on their
            registered competitions.
          </p>
        </div>
      </div>

      <ParentNoticeGenerator students={students} settings={settings} />
    </section>
  );
}
