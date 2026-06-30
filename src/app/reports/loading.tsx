export default function ReportsLoading() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="h-4 w-20 rounded bg-muted" />
        <div className="mt-3 h-8 w-48 rounded bg-muted" />
        <div className="mt-4 h-4 w-full max-w-2xl rounded bg-muted" />
        <div className="mt-2 h-4 w-full max-w-xl rounded bg-muted" />
      </div>

      <div className="h-14 rounded-lg border bg-card p-2 shadow-sm" />

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="h-6 w-36 rounded bg-muted" />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="h-16 rounded bg-muted" />
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="mt-3 h-8 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="h-6 w-48 rounded bg-muted" />
        <div className="mt-5 flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-12 rounded bg-muted" />
          ))}
        </div>
      </div>
    </section>
  );
}
