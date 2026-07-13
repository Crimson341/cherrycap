import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { FileText, FolderOpen, MessageSquareText } from "lucide-react";
import {
  ClientAuthUnavailable,
  ClientPortalChrome,
} from "@/components/client-portal/ClientPortalChrome";
import { isClientAuthConfigured } from "@/lib/clientAuth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client Portal",
  robots: { index: false, follow: false },
};

const portalAreas = [
  {
    icon: FolderOpen,
    label: "Project workspace",
    description: "Milestones, active tasks, and the decisions that keep your project moving.",
  },
  {
    icon: MessageSquareText,
    label: "Messages & feedback",
    description: "A focused place for questions, approvals, and design feedback without lost threads.",
  },
  {
    icon: FileText,
    label: "Files & documents",
    description: "Shared assets, launch materials, invoices, and the important files for your engagement.",
  },
];

export default async function ClientPortalPage() {
  if (!isClientAuthConfigured()) {
    return (
      <ClientPortalChrome
        eyebrow="Private client portal"
        title="Your project, in one clear place."
        description="Cherry Capital client accounts will keep project progress, communication, and shared materials together behind a secure login."
      >
        <ClientAuthUnavailable />
      </ClientPortalChrome>
    );
  }

  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: "/portal" });
  }

  const user = await currentUser();
  const firstName = user?.firstName ?? "there";

  return (
    <ClientPortalChrome
      eyebrow="Private client portal"
      title={`Good to see you, ${firstName}.`}
      description="This secure workspace is the foundation for your Cherry Capital project experience. Project-specific tools will appear here as they are connected."
    >
      <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-black/15 bg-white/60 px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/45">Signed in as</p>
          <p className="mt-1 text-sm font-medium">{user?.primaryEmailAddress?.emailAddress}</p>
        </div>
        <UserButton />
      </div>

      <div className="grid gap-px overflow-hidden rounded-[2rem] border border-black/15 bg-black/15 md:grid-cols-3">
        {portalAreas.map(({ icon: Icon, label, description }) => (
          <article key={label} className="min-h-64 bg-[#fbfaf6] p-7 md:p-9">
            <div className="mb-12 grid size-11 place-items-center rounded-full bg-[#181816] text-white">
              <Icon size={19} />
            </div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#9d282e]">
              Coming next
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">{label}</h2>
            <p className="mt-3 text-sm leading-6 text-black/58">{description}</p>
          </article>
        ))}
      </div>
    </ClientPortalChrome>
  );
}
