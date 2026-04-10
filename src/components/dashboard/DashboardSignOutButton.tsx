"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export function DashboardSignOutButton() {
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="outline"
      className="rounded-none font-mono uppercase tracking-[0.18em]"
      disabled={pending}
      onClick={() => {
        setPending(true);
        void fetch("/api/auth", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            action: "auth:signOut",
            args: {},
          }),
        })
          .then(() => {
            window.location.replace("/signin");
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
