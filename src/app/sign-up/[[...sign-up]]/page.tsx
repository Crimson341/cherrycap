import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import {
  ClientAuthUnavailable,
  ClientPortalChrome,
} from "@/components/client-portal/ClientPortalChrome";
import { isClientAuthConfigured } from "@/lib/clientAuth";

export const metadata: Metadata = {
  title: "Create a Client Account",
  robots: { index: false, follow: false },
};

export default function ClientSignUpPage() {
  const configured = isClientAuthConfigured();

  return (
    <ClientPortalChrome
      eyebrow="Client portal · Create account"
      title="Let’s make the work easier to follow."
      description="Create your secure Cherry Capital account. Your portal will become the shared home for project progress, files, feedback, and decisions."
    >
      {configured ? (
        <div className="mx-auto flex max-w-lg justify-center rounded-[2rem] border border-black/15 bg-white p-4 shadow-[0_30px_90px_rgba(0,0,0,0.12)] md:p-8">
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/portal"
          />
        </div>
      ) : (
        <ClientAuthUnavailable />
      )}
    </ClientPortalChrome>
  );
}
