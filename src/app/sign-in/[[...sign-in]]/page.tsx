import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import {
  ClientAuthUnavailable,
  ClientPortalChrome,
} from "@/components/client-portal/ClientPortalChrome";
import { isClientAuthConfigured } from "@/lib/clientAuth";

export const metadata: Metadata = {
  title: "Client Sign In",
  robots: { index: false, follow: false },
};

export default function ClientSignInPage() {
  const configured = isClientAuthConfigured();

  return (
    <ClientPortalChrome
      eyebrow="Client portal · Sign in"
      title="Welcome back."
      description="Sign in to reach your project workspace, shared files, decisions, and the next steps we are working through together."
    >
      {configured ? (
        <div className="mx-auto flex max-w-lg justify-center rounded-[2rem] border border-black/15 bg-white p-4 shadow-[0_30px_90px_rgba(0,0,0,0.12)] md:p-8">
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/portal"
          />
        </div>
      ) : (
        <ClientAuthUnavailable />
      )}
    </ClientPortalChrome>
  );
}
