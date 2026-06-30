export default function ActivitiesLoading() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="h-4 w-20 rounded bg-muted" />
        <div className="mt-3 h-8 w-60 rounded bg-muted" />
        <div className="mt-4 h-4 w-full max-w-2xl rounded bg-muted" />
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="h-6 w-36 rounded bg-muted" />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="h-10 rounded bg-muted" />
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="h-6 w-40 rounded bg-muted" />
        <div className="mt-5 flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-12 rounded bg-muted" />
          ))}
        </div>
      </div>
    </section>
  );
}
