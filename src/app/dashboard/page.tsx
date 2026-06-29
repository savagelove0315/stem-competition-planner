import { PlaceholderPage } from "@/components/shared/placeholder-page";

export default function DashboardPage() {
  return (
    <PlaceholderPage
      title="Dashboard"
      description="A future operations overview for competition planning, registrations, schedule health, and conflict status."
      nextSteps={[
        "Add summary metrics from generic competition data.",
        "Surface upcoming activities and unresolved conflicts.",
        "Introduce reporting charts after data services exist.",
      ]}
    />
  );
}
