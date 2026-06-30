export default function NoticeSettingsLoading() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="mt-3 h-8 w-72 rounded bg-muted" />
        <div className="mt-4 h-4 w-full max-w-2xl rounded bg-muted" />
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="h-6 w-52 rounded bg-muted" />
        <div className="mt-2 h-4 w-full max-w-xl rounded bg-muted" />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 rounded bg-muted" />
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-24 rounded bg-muted" />
          ))}
        </div>
      </div>
    </section>
  );
}
