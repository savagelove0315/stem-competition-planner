import { PlaceholderPage } from "@/components/shared/placeholder-page";

export default function CompetitionsPage() {
  return (
    <PlaceholderPage
      title="Competitions"
      description="A future workspace for creating and configuring competitions as data records."
      nextSteps={[
        "List competitions from the database when Supabase is added.",
        "Create generic competition setup and edit flows.",
        "Keep competition behavior driven by configuration.",
      ]}
    />
  );
}
