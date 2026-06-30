export default function StudentTimelineLoading() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="h-4 w-20 rounded bg-muted" />
        <div className="mt-3 h-8 w-64 rounded bg-muted" />
        <div className="mt-4 h-4 w-full max-w-2xl rounded bg-muted" />
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="h-6 w-24 rounded bg-muted" />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="h-10 rounded bg-muted" />
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 rounded-lg border bg-card shadow-sm">
            <div className="m-4 h-4 w-28 rounded bg-muted" />
            <div className="m-4 h-7 w-20 rounded bg-muted" />
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="h-6 w-32 rounded bg-muted" />
        <div className="mt-5 flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-16 rounded bg-muted" />
          ))}
        </div>
      </div>
    </section>
  );
}
