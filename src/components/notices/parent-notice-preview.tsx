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

  return (
    <article className="notice-print-area notice-page overflow-hidden rounded-lg border bg-card shadow-sm">
      <header className="notice-header bg-slate-900 px-6 py-5 text-white md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em]">
          OFFICIAL NOTICE
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-normal md:text-4xl">
          STEM 比赛参与通知
        </h2>
        <p className="mt-2 text-sm text-slate-200 md:text-base">
          STEM Competition Participation Notice
        </p>
      </header>

      <div className="notice-content flex flex-col gap-6 p-6 md:p-8">
        <div className="text-base leading-8">
          <p>亲爱的家长：</p>
          <p>您好。</p>
        </div>

        <p className="notice-student-line rounded-md border border-primary/20 bg-primary/10 px-4 py-3 text-base font-medium leading-8 text-foreground">
          谨此通知，<span className="font-semibold text-primary">{studentName}</span>{" "}
          同学已被遴选 / 报名参加以下 STEM 相关比赛：
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
          <p>
            该学生可能需要在课后留下进行训练。具体训练日期与时间将会另行提前通知。
          </p>
          <p>
            恳请家长给予鼓励与支持，并提醒孩子认真参与训练，为比赛做好准备。
          </p>
          <p>感谢您的配合与支持。</p>
        </div>

        <div className="pt-2">
          <p className="text-lg font-semibold">Teacher Hilda</p>
          <p className="mt-1 text-sm text-muted-foreground">负责老师</p>
        </div>

        <footer className="border-t pt-4 text-xs text-muted-foreground">
          此通知供学生个人比赛参与确认用途。
        </footer>
      </div>
    </article>
  );
}
