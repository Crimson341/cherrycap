import { Button } from "@/components/ui/button";

export function DashboardSignOutButton() {
  return (
    <form method="post" action="/api/auth">
      <input type="hidden" name="action" value="auth:signOut" />
      <input type="hidden" name="redirectTo" value="/signin" />
      <Button
        variant="outline"
        className="rounded-none font-mono uppercase tracking-[0.18em]"
        type="submit"
      >
        Sign out
      </Button>
    </form>
  );
}
