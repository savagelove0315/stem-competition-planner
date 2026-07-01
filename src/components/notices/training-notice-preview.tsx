import type { NoticeSettings } from "@/features/notice-settings/types";
import type {
  TrainingNoticeActivity,
  TrainingNoticeStudent,
} from "@/features/notices/types";
import {
  formatNoticeField,
  formatTrainingNoticeDate,
  formatTrainingNoticeTime,
  getTrainingNoticeStudentName,
} from "@/features/notices/utils";

type TrainingNoticePreviewProps = {
  activity: TrainingNoticeActivity;
  student: TrainingNoticeStudent;
  settings: NoticeSettings;
  whatToBring: string;
};

export function TrainingNoticePreview({
  activity,
  student,
  settings,
  whatToBring,
}: TrainingNoticePreviewProps) {
  const studentName = getTrainingNoticeStudentName(student);
  const detailRows = [
    ["训练项目 / Training Activity", activity.name],
    ["相关比赛 / Competition", formatNoticeField(activity.competition?.name ?? null)],
    ["日期 / Date", formatTrainingNoticeDate(activity.startsAt)],
    ["时间 / Time", formatTrainingNoticeTime(activity)],
    ["地点 / Venue", formatNoticeField(activity.location)],
    ["需携带物品 / What to Bring", formatNoticeField(whatToBring)],
  ];

  return (
    <article className="notice-print-area notice-page overflow-hidden rounded-lg border bg-card shadow-sm">
      <header className="notice-header bg-slate-900 px-6 py-5 text-white md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em]">
          OFFICIAL NOTICE
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-normal md:text-4xl">
          训练通知
        </h2>
        <p className="mt-2 text-sm text-slate-200 md:text-base">
          Training Notice
        </p>
      </header>

      <div className="notice-content flex flex-col gap-6 p-6 md:p-8">
        <div className="text-base leading-8">
          <p>亲爱的家长：</p>
          <p>您好。</p>
        </div>

        <p className="notice-student-line rounded-md border border-primary/20 bg-primary/10 px-4 py-3 text-base font-medium leading-8 text-foreground">
          谨此通知，
          <span className="font-semibold text-primary">{studentName}</span>
          同学需要参加以下训练：
        </p>

        <div className="notice-table-wrapper rounded-md border">
          <table className="notice-table w-full border-collapse text-left text-sm">
            <colgroup>
              <col className="notice-training-label" />
              <col className="notice-training-value" />
            </colgroup>
            <tbody className="divide-y">
              {detailRows.map(([label, value]) => (
                <tr key={label} className="align-top">
                  <th className="bg-slate-100 px-4 py-3 font-semibold text-slate-700">
                    {label}
                  </th>
                  <td className="px-4 py-3">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="notice-message rounded-md border bg-muted/40 px-4 py-4 text-base leading-8">
          <p>请家长提醒孩子准时出席训练，并携带所需物品。</p>
          <p>感谢您的配合与支持。</p>
        </div>

        <div className="pt-2">
          <p className="text-lg font-semibold">{settings.teacherDisplayName}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {settings.teacherRoleLabel}
          </p>
        </div>
      </div>
    </article>
  );
}
