export default function NoticesLoading() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="h-4 w-28 rounded bg-muted" />
        <div className="mt-3 h-8 w-56 rounded bg-muted" />
        <div className="mt-4 h-4 w-full max-w-2xl rounded bg-muted" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.35fr_0.65fr]">
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="mt-3 h-10 rounded bg-muted" />
            <div className="mt-3 h-3 w-48 rounded bg-muted" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-36 rounded bg-muted" />
            <div className="h-9 w-28 rounded bg-muted" />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="bg-muted p-6">
            <div className="h-4 w-32 rounded bg-background" />
            <div className="mt-3 h-9 w-64 rounded bg-background" />
            <div className="mt-3 h-4 w-72 rounded bg-background" />
          </div>
          <div className="flex flex-col gap-5 p-6">
            <div className="h-16 rounded bg-muted" />
            <div className="h-52 rounded bg-muted" />
            <div className="h-28 rounded bg-muted" />
          </div>
        </div>
      </div>
    </section>
  );
}
