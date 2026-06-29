import { PlaceholderPage } from "@/components/shared/placeholder-page";

export default function ConflictsPage() {
  return (
    <PlaceholderPage
      title="Conflicts"
      description="A future review surface for student, team, location, and rule-based scheduling conflicts."
      nextSteps={[
        "Implement conflict detection in feature services.",
        "Review conflicts by status and severity.",
        "Resolve conflicts without competition-specific branches.",
      ]}
    />
  );
}
