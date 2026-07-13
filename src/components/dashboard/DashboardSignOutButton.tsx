import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DashboardSignOutButton({
  className,
}: {
  className?: string;
}) {
  return (
    <form method="post" action="/api/auth">
      <input type="hidden" name="action" value="auth:signOut" />
      <input type="hidden" name="redirectTo" value="/signin" />
      <Button
        variant="outline"
        className={cn(
          "rounded-none font-mono uppercase tracking-[0.18em]",
          className,
        )}
        type="submit"
      >
        Sign out
      </Button>
    </form>
  );
}
