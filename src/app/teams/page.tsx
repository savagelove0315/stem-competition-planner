import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/require-user";

export default async function TeamsPage() {
  await requireUser("/teams");

  redirect("/competitions");
}
