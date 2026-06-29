import { PlaceholderPage } from "@/components/shared/placeholder-page";

export default function TimelinePage() {
  return (
    <PlaceholderPage
      title="Timeline"
      description="A future schedule overview for activity placement across competitions, teams, students, and locations."
      nextSteps={[
        "Add filters for competition, team, student, location, and date.",
        "Render schedule items from generic data.",
        "Keep overlap checks inside conflict services.",
      ]}
    />
  );
}
