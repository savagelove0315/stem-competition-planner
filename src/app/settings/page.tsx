import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { requireUser } from "@/lib/auth/require-user";

export default async function SettingsPage() {
  await requireUser("/settings");

  return (
    <PlaceholderPage
      title="Settings"
      description="A future administrative area for app preferences, organization setup, and planning defaults."
      nextSteps={[
        "Separate organization settings from competition settings.",
        "Add role-aware options after auth is planned.",
        "Keep defaults generic and configurable.",
      ]}
    />
  );
}
