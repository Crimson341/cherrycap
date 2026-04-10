"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DashboardSignOutButton() {
  const authActions = useAuthActions();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  if (!authActions?.signOut) {
    return null;
  }

  return (
    <Button
      variant="outline"
      className="rounded-none font-mono uppercase tracking-[0.18em]"
      disabled={pending}
      onClick={() => {
        setPending(true);
        void authActions.signOut()
          .then(() => {
            router.replace("/signin");
            router.refresh();
          })
          .finally(() => {
            setPending(false);
          });
      }}
      type="button"
    >
      {pending ? "Signing out" : "Sign out"}
    </Button>
  );
}
