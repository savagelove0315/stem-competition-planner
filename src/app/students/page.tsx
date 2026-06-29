import { PlaceholderPage } from "@/components/shared/placeholder-page";

export default function StudentsPage() {
  return (
    <PlaceholderPage
      title="Students"
      description="A future operational table for managing student records and participation across competitions."
      nextSteps={[
        "Add a dense student table with filters.",
        "Connect registrations through data relationships.",
        "Validate create and edit flows with Zod.",
      ]}
    />
  );
}
