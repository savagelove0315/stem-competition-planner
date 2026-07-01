"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  saveCompetitionNoticeSettingsAction,
  saveTrainingNoticeSettingsAction,
} from "@/features/notice-settings/actions";
import type {
  CompetitionNoticeSettingsFormValues,
  TrainingNoticeSettingsFormValues,
} from "@/features/notice-settings/schemas";
import type {
  CompetitionNoticeSettings,
  NoticeSettingsActionState,
  TrainingNoticeSettings,
} from "@/features/notice-settings/types";
import { cn } from "@/lib/utils";

type NoticeSettingsFormProps = {
  competitionSettings: CompetitionNoticeSettings;
  trainingSettings: TrainingNoticeSettings;
};

type CompetitionField = keyof CompetitionNoticeSettingsFormValues;
type TrainingField = keyof TrainingNoticeSettingsFormValues;
type NoticeSettingsMode = "competition" | "training";

const initialCompetitionState: NoticeSettingsActionState<CompetitionField> = {
  status: "idle",
  message: null,
};
const initialTrainingState: NoticeSettingsActionState<TrainingField> = {
  status: "idle",
  message: null,
};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-xs text-destructive">{errors[0]}</p>;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <Save aria-hidden="true" />
      )}
      {pending ? "Saving" : label}
    </Button>
  );
}

function ActionMessage({
  state,
}: {
  state: NoticeSettingsActionState<string>;
}) {
  if (!state.message) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        state.status === "success"
          ? "flex items-start gap-2 border-primary/30 bg-primary/10 text-primary"
          : "border-destructive/30 bg-destructive/10 text-destructive",
      )}
    >
      {state.status === "success" ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      ) : null}
      <p>{state.message}</p>
    </div>
  );
}

function TextInput<TField extends string>({
  id,
  label,
  name,
  defaultValue,
  errors,
}: {
  id: string;
  label: string;
  name: TField;
  defaultValue: string;
  errors?: string[];
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        defaultValue={defaultValue}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
      />
      <FieldError errors={errors} />
    </div>
  );
}

function TextArea<TField extends string>({
  id,
  label,
  name,
  defaultValue,
  errors,
  rows = 3,
}: {
  id: string;
  label: string;
  name: TField;
  defaultValue: string;
  errors?: string[];
  rows?: number;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
      />
      <FieldError errors={errors} />
    </div>
  );
}

function TemplateHint() {
  return (
    <div className="text-xs leading-5 text-muted-foreground">
      Include <code className="rounded bg-muted px-1 py-0.5">{"{studentName}"}</code>{" "}
      where the selected student name should appear.
    </div>
  );
}

function CompetitionSettingsForm({
  settings,
}: {
  settings: CompetitionNoticeSettings;
}) {
  const [state, formAction] = useActionState(
    saveCompetitionNoticeSettingsAction,
    initialCompetitionState,
  );

  return (
    <form action={formAction} className="grid gap-5 rounded-lg border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Competition Notice Settings</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          These settings control notices generated from student competition
          registrations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          id="competition-teacherDisplayName"
          label="Teacher Display Name"
          name="teacherDisplayName"
          defaultValue={settings.teacherDisplayName}
          errors={state.fieldErrors?.teacherDisplayName}
        />
        <TextInput
          id="competition-teacherRoleLabel"
          label="Teacher Role Label"
          name="teacherRoleLabel"
          defaultValue={settings.teacherRoleLabel}
          errors={state.fieldErrors?.teacherRoleLabel}
        />
        <TextInput
          id="competition-officialNoticeLabel"
          label="Official Notice Label"
          name="officialNoticeLabel"
          defaultValue={settings.officialNoticeLabel}
          errors={state.fieldErrors?.officialNoticeLabel}
        />
        <TextInput
          id="competition-noticeTitleChinese"
          label="Chinese Title"
          name="noticeTitleChinese"
          defaultValue={settings.noticeTitleChinese}
          errors={state.fieldErrors?.noticeTitleChinese}
        />
        <TextInput
          id="competition-noticeSubtitleEnglish"
          label="English Subtitle"
          name="noticeSubtitleEnglish"
          defaultValue={settings.noticeSubtitleEnglish}
          errors={state.fieldErrors?.noticeSubtitleEnglish}
        />
      </div>

      <TextArea
        id="competition-openingGreeting"
        label="Opening Greeting"
        name="openingGreeting"
        defaultValue={settings.openingGreeting}
        errors={state.fieldErrors?.openingGreeting}
      />
      <TextArea
        id="competition-mainSentenceTemplate"
        label="Main Sentence Template"
        name="mainSentenceTemplate"
        defaultValue={settings.mainSentenceTemplate}
        errors={state.fieldErrors?.mainSentenceTemplate}
      />
      <TemplateHint />
      <TextArea
        id="competition-trainingMessage"
        label="Training / Participation Message"
        name="trainingMessage"
        defaultValue={settings.trainingMessage}
        errors={state.fieldErrors?.trainingMessage}
      />
      <TextArea
        id="competition-supportMessage"
        label="Support Message"
        name="supportMessage"
        defaultValue={settings.supportMessage}
        errors={state.fieldErrors?.supportMessage}
      />
      <TextInput
        id="competition-thankYouLine"
        label="Thank You Line"
        name="thankYouLine"
        defaultValue={settings.thankYouLine}
        errors={state.fieldErrors?.thankYouLine}
      />
      <TextInput
        id="competition-footerNote"
        label="Footer Note"
        name="footerNote"
        defaultValue={settings.footerNote}
        errors={state.fieldErrors?.footerNote}
      />

      <ActionMessage state={state} />
      <div>
        <SubmitButton label="Save Competition Notice Settings" />
      </div>
    </form>
  );
}

function TrainingSettingsForm({ settings }: { settings: TrainingNoticeSettings }) {
  const [state, formAction] = useActionState(
    saveTrainingNoticeSettingsAction,
    initialTrainingState,
  );

  return (
    <form action={formAction} className="grid gap-5 rounded-lg border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Training Notice Settings</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          These settings control notices generated from activity participants.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          id="training-teacherDisplayName"
          label="Teacher Display Name"
          name="teacherDisplayName"
          defaultValue={settings.teacherDisplayName}
          errors={state.fieldErrors?.teacherDisplayName}
        />
        <TextInput
          id="training-teacherRoleLabel"
          label="Teacher Role Label"
          name="teacherRoleLabel"
          defaultValue={settings.teacherRoleLabel}
          errors={state.fieldErrors?.teacherRoleLabel}
        />
        <TextInput
          id="training-officialNoticeLabel"
          label="Official Notice Label"
          name="officialNoticeLabel"
          defaultValue={settings.officialNoticeLabel}
          errors={state.fieldErrors?.officialNoticeLabel}
        />
        <TextInput
          id="training-noticeTitleChinese"
          label="Chinese Title"
          name="noticeTitleChinese"
          defaultValue={settings.noticeTitleChinese}
          errors={state.fieldErrors?.noticeTitleChinese}
        />
        <TextInput
          id="training-noticeSubtitleEnglish"
          label="English Subtitle"
          name="noticeSubtitleEnglish"
          defaultValue={settings.noticeSubtitleEnglish}
          errors={state.fieldErrors?.noticeSubtitleEnglish}
        />
      </div>

      <TextArea
        id="training-openingGreeting"
        label="Opening Greeting"
        name="openingGreeting"
        defaultValue={settings.openingGreeting}
        errors={state.fieldErrors?.openingGreeting}
      />
      <TextArea
        id="training-mainSentenceTemplate"
        label="Main Sentence Template"
        name="mainSentenceTemplate"
        defaultValue={settings.mainSentenceTemplate}
        errors={state.fieldErrors?.mainSentenceTemplate}
      />
      <TemplateHint />
      <TextArea
        id="training-reminderLine"
        label="Reminder Line"
        name="reminderLine"
        defaultValue={settings.reminderLine}
        errors={state.fieldErrors?.reminderLine}
      />
      <TextArea
        id="training-defaultWhatToBring"
        label="Default What to Bring"
        name="defaultWhatToBring"
        defaultValue={settings.defaultWhatToBring}
        errors={state.fieldErrors?.defaultWhatToBring}
      />
      <TextInput
        id="training-thankYouLine"
        label="Thank You Line"
        name="thankYouLine"
        defaultValue={settings.thankYouLine}
        errors={state.fieldErrors?.thankYouLine}
      />
      <TextInput
        id="training-footerNote"
        label="Footer Note"
        name="footerNote"
        defaultValue={settings.footerNote}
        errors={state.fieldErrors?.footerNote}
      />

      <ActionMessage state={state} />
      <div>
        <SubmitButton label="Save Training Notice Settings" />
      </div>
    </form>
  );
}

export function NoticeSettingsForm({
  competitionSettings,
  trainingSettings,
}: NoticeSettingsFormProps) {
  const [mode, setMode] = useState<NoticeSettingsMode>("competition");

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="grid gap-2 rounded-lg border bg-card p-2 shadow-sm md:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("competition")}
          className={cn(
            "rounded-md px-4 py-3 text-left transition-colors hover:bg-muted",
            mode === "competition" && "bg-primary text-primary-foreground",
          )}
        >
          <span className="block text-sm font-semibold">
            Competition Notice Settings
          </span>
          <span
            className={cn(
              "mt-1 block text-xs leading-5 text-muted-foreground",
              mode === "competition" && "text-primary-foreground/80",
            )}
          >
            Wording for competition participation notices.
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMode("training")}
          className={cn(
            "rounded-md px-4 py-3 text-left transition-colors hover:bg-muted",
            mode === "training" && "bg-primary text-primary-foreground",
          )}
        >
          <span className="block text-sm font-semibold">
            Training Notice Settings
          </span>
          <span
            className={cn(
              "mt-1 block text-xs leading-5 text-muted-foreground",
              mode === "training" && "text-primary-foreground/80",
            )}
          >
            Wording for training stay-back notices.
          </span>
        </button>
      </div>

      {mode === "competition" ? (
        <CompetitionSettingsForm settings={competitionSettings} />
      ) : (
        <TrainingSettingsForm settings={trainingSettings} />
      )}
    </div>
  );
}
