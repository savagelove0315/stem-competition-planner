import type {
  NoticeSettings,
} from "@/features/notice-settings/types";
import type {
  NoticeCompetitionAssignment,
  NoticeStudent,
} from "@/features/notices/types";
import {
  formatNoticeField,
  formatNoticePeriod,
  getNoticeStudentName,
} from "@/features/notices/utils";

type ParentNoticePreviewProps = {
  student: NoticeStudent | null;
  assignments: NoticeCompetitionAssignment[];
  settings: NoticeSettings;
};

function EmptyNoticeState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <section className="rounded-lg border border-dashed bg-card p-8 text-center shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p>
    </section>
  );
}

export function ParentNoticePreview({
  student,
  assignments,
  settings,
}: ParentNoticePreviewProps) {
  if (!student) {
    return (
      <EmptyNoticeState
        title="No student selected"
        message="Choose one student to preview a parent notice."
      />
    );
  }

  if (assignments.length === 0) {
    return (
      <EmptyNoticeState
        title="No registered competitions"
        message="This student does not have active competition registrations yet."
      />
    );
  }

  const studentName = getNoticeStudentName(student);
  const [mainSentenceBeforeName, ...mainSentenceAfterName] =
    settings.mainSentenceTemplate.split("{studentName}");
  const openingGreetingLines = settings.openingGreeting.split("\n");

  return (
    <article className="notice-print-area notice-page overflow-hidden rounded-lg border bg-card shadow-sm">
      <header className="notice-header bg-slate-900 px-6 py-5 text-white md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em]">
          OFFICIAL NOTICE
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-normal md:text-4xl">
          {settings.noticeTitleChinese}
        </h2>
        <p className="mt-2 text-sm text-slate-200 md:text-base">
          {settings.noticeSubtitleEnglish}
        </p>
      </header>

      <div className="notice-content flex flex-col gap-6 p-6 md:p-8">
        <div className="text-base leading-8">
          {openingGreetingLines.map((line, index) => (
            <p key={`${line}-${index}`}>{line}</p>
          ))}
        </div>

        <p className="notice-student-line rounded-md border border-primary/20 bg-primary/10 px-4 py-3 text-base font-medium leading-8 text-foreground">
          {mainSentenceBeforeName}
          <span className="font-semibold text-primary">{studentName}</span>
          {mainSentenceAfterName.join("{studentName}")}
        </p>

        <div className="notice-table-wrapper overflow-x-auto rounded-md border">
          <table className="notice-table w-full min-w-[720px] border-collapse text-left text-sm">
            <colgroup>
              <col className="notice-col-index" />
              <col className="notice-col-name" />
              <col className="notice-col-category" />
              <col className="notice-col-mode" />
              <col className="notice-col-period" />
            </colgroup>
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="w-16 border-b px-4 py-3 font-semibold">序</th>
                <th className="border-b px-4 py-3 font-semibold">比赛名称</th>
                <th className="border-b px-4 py-3 font-semibold">类别</th>
                <th className="border-b px-4 py-3 font-semibold">形式</th>
                <th className="border-b px-4 py-3 font-semibold">
                  预计进行时段
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {assignments.map((assignment, index) => (
                <tr key={assignment.id} className="align-top">
                  <td className="px-4 py-4 font-medium">{index + 1}</td>
                  <td className="px-4 py-4 font-medium">
                    {assignment.competition.name}
                  </td>
                  <td className="px-4 py-4">
                    {formatNoticeField(assignment.competition.category)}
                  </td>
                  <td className="px-4 py-4">
                    {formatNoticeField(assignment.competition.noticeMode)}
                  </td>
                  <td className="px-4 py-4">
                    {formatNoticePeriod(assignment.competition)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="notice-message rounded-md border bg-muted/40 px-4 py-4 text-base leading-8">
          <p>{settings.trainingMessage}</p>
          <p>{settings.supportMessage}</p>
          <p>{settings.thankYouLine}</p>
        </div>

        <div className="pt-2">
          <p className="text-lg font-semibold">{settings.teacherDisplayName}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {settings.teacherRoleLabel}
          </p>
        </div>

        <footer className="border-t pt-4 text-xs text-muted-foreground">
          {settings.footerNote}
        </footer>
      </div>
    </article>
  );
}
