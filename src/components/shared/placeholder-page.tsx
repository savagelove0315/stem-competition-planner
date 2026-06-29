type PlaceholderPageProps = {
  title: string;
  description: string;
  nextSteps: string[];
};

export function PlaceholderPage({
  title,
  description,
  nextSteps,
}: PlaceholderPageProps) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-primary">App shell placeholder</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal md:text-3xl">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
            {description}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {nextSteps.map((step) => (
          <div key={step} className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-sm font-medium leading-6">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
