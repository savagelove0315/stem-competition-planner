"use client";

import { AlertCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ActivitiesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="mx-auto w-full max-w-6xl rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-destructive shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-1 size-5 shrink-0" aria-hidden="true" />
        <div>
          <h1 className="text-lg font-semibold">Activity Master could not load</h1>
          <p className="mt-2 text-sm leading-6">{error.message}</p>
          <Button type="button" className="mt-4" onClick={reset}>
            <RotateCcw aria-hidden="true" />
            Try again
          </Button>
        </div>
      </div>
    </section>
  );
}
