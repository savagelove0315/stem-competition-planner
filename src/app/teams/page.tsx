import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { requireUser } from "@/lib/auth/require-user";

export default async function TeamsPage() {
  await requireUser("/teams");

  return (
    <PlaceholderPage
      title="Teams"
      description="A future team arrangement workspace for grouping students inside competitions."
      nextSteps={[
        "List teams by selected competition.",
        "Assign members through relationship data.",
        "Support team schedule checks through shared services.",
      ]}
    />
  );
}
