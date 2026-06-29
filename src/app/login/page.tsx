import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            SP
          </div>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Access the STEM Competition Planner workspace.
          </p>
        </div>
        <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading sign in</p>}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
