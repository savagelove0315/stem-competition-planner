"use client";

import { useState } from "react";
import { Check, Copy, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

type NoticeActionsProps = {
  noticeText: string;
  disabled: boolean;
  copyLabel?: string;
  copiedLabel?: string;
  printLabel?: string;
};

export function NoticeActions({
  noticeText,
  disabled,
  copyLabel = "Copy notice text",
  copiedLabel = "Copied",
  printLabel = "Print notice",
}: NoticeActionsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (disabled) {
      return;
    }

    await navigator.clipboard.writeText(noticeText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function handlePrint() {
    if (disabled) {
      return;
    }

    document.body.classList.add("printing-notice");

    const cleanup = () => {
      document.body.classList.remove("printing-notice");
      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);
    window.print();
  }

  return (
    <div className="notice-print-hidden flex flex-wrap items-center gap-2 print:hidden">
      <Button type="button" variant="outline" onClick={handleCopy} disabled={disabled}>
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        {copied ? copiedLabel : copyLabel}
      </Button>
      <Button type="button" onClick={handlePrint} disabled={disabled}>
        <Printer aria-hidden="true" />
        {printLabel}
      </Button>
    </div>
  );
}
