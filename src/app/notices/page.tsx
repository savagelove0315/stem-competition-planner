import { NoticeGeneratorWorkspace } from "@/components/notices/notice-generator-workspace";
import {
  getCompetitionNoticeSettings,
  getTrainingNoticeSettings,
} from "@/features/notice-settings/queries";
import {
  listNoticeStudents,
  listTrainingNoticeActivities,
} from "@/features/notices/queries";
import { requireUser } from "@/lib/auth/require-user";

export default async function NoticesPage() {
  await requireUser("/notices");

  const [
    students,
    trainingActivities,
    competitionSettings,
    trainingSettings,
  ] = await Promise.all([
    listNoticeStudents(),
    listTrainingNoticeActivities(),
    getCompetitionNoticeSettings({ fallbackOnError: true }),
    getTrainingNoticeSettings({ fallbackOnError: true }),
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
            Generate read-only parent notices from competition registrations
            or training activity assignments. Generated notices are previewed,
            copied, or printed without being saved.
          </p>
        </div>
      </div>

      <NoticeGeneratorWorkspace
        students={students}
        trainingActivities={trainingActivities}
        competitionSettings={competitionSettings}
        trainingSettings={trainingSettings}
      />
    </section>
  );
}
