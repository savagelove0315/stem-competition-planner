"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  saveNoticeSettingsAction,
  type NoticeSettingsActionState,
} from "@/features/notice-settings/actions";
import type { NoticeSettingsFormValues } from "@/features/notice-settings/schemas";
import type { NoticeSettings } from "@/features/notice-settings/types";

type NoticeSettingsFormProps = {
  settings: NoticeSettings;
};

type NoticeSettingsField = keyof NoticeSettingsFormValues;

const initialState: NoticeSettingsActionState = {
  status: "idle",
  message: null,
};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-xs text-destructive">{errors[0]}</p>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <Save aria-hidden="true" />
      )}
      {pending ? "Saving" : "Save Notice Settings"}
    </Button>
  );
}

function TextInput({
  id,
  label,
  name,
  defaultValue,
  errors,
}: {
  id: string;
  label: string;
  name: NoticeSettingsField;
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

function TextArea({
  id,
  label,
  name,
  defaultValue,
  errors,
  rows = 3,
}: {
  id: string;
  label: string;
  name: NoticeSettingsField;
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

export function NoticeSettingsForm({ settings }: NoticeSettingsFormProps) {
  const [state, formAction] = useActionState(
    saveNoticeSettingsAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-5 rounded-lg border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Default notice wording</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          These settings are used by the Parent Notice Generator when previewing,
          copying, and printing notices.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          id="teacherDisplayName"
          label="Teacher Display Name"
          name="teacherDisplayName"
          defaultValue={settings.teacherDisplayName}
          errors={state.fieldErrors?.teacherDisplayName}
        />
        <TextInput
          id="teacherRoleLabel"
          label="Teacher Role Label"
          name="teacherRoleLabel"
          defaultValue={settings.teacherRoleLabel}
          errors={state.fieldErrors?.teacherRoleLabel}
        />
        <TextInput
          id="noticeTitleChinese"
          label="Notice Title Chinese"
          name="noticeTitleChinese"
          defaultValue={settings.noticeTitleChinese}
          errors={state.fieldErrors?.noticeTitleChinese}
        />
        <TextInput
          id="noticeSubtitleEnglish"
          label="Notice Subtitle English"
          name="noticeSubtitleEnglish"
          defaultValue={settings.noticeSubtitleEnglish}
          errors={state.fieldErrors?.noticeSubtitleEnglish}
        />
      </div>

      <TextArea
        id="openingGreeting"
        label="Opening Greeting"
        name="openingGreeting"
        defaultValue={settings.openingGreeting}
        errors={state.fieldErrors?.openingGreeting}
      />
      <TextArea
        id="mainSentenceTemplate"
        label="Main Sentence Template"
        name="mainSentenceTemplate"
        defaultValue={settings.mainSentenceTemplate}
        errors={state.fieldErrors?.mainSentenceTemplate}
      />
      <div className="text-xs leading-5 text-muted-foreground">
        Include <code className="rounded bg-muted px-1 py-0.5">{"{studentName}"}</code>{" "}
        where the selected student name should appear.
      </div>
      <TextArea
        id="trainingMessage"
        label="Training Message"
        name="trainingMessage"
        defaultValue={settings.trainingMessage}
        errors={state.fieldErrors?.trainingMessage}
      />
      <TextArea
        id="supportMessage"
        label="Support Message"
        name="supportMessage"
        defaultValue={settings.supportMessage}
        errors={state.fieldErrors?.supportMessage}
      />
      <TextInput
        id="thankYouLine"
        label="Thank You Line"
        name="thankYouLine"
        defaultValue={settings.thankYouLine}
        errors={state.fieldErrors?.thankYouLine}
      />
      <TextInput
        id="footerNote"
        label="Footer Note"
        name="footerNote"
        defaultValue={settings.footerNote}
        errors={state.fieldErrors?.footerNote}
      />

      {state.message ? (
        <div
          className={
            state.status === "success"
              ? "flex items-start gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"
              : "rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          }
        >
          {state.status === "success" ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          ) : null}
          <p>{state.message}</p>
        </div>
      ) : null}

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
