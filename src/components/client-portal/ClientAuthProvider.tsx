import { ClerkProvider } from "@clerk/nextjs";
import { isClientAuthConfigured } from "@/lib/clientAuth";

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  if (!isClientAuthConfigured()) {
    return children;
  }

  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/portal"
      signUpFallbackRedirectUrl="/portal"
    >
      {children}
    </ClerkProvider>
  );
}
