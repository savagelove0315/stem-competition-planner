import { PlaceholderPage } from "@/components/shared/placeholder-page";

export default function StudentTimelinePage() {
  return (
    <PlaceholderPage
      title="Student Timeline"
      description="A future student-centered view for checking one learner's activities across all selected competitions."
      nextSteps={[
        "Select a student from generic records.",
        "Show assigned activities by time range.",
        "Highlight overlaps after conflict detection exists.",
      ]}
    />
  );
}
