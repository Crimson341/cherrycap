"use client";

import { useParams, useRouter } from "next/navigation";
import { useUser, SignIn, SignedIn, SignedOut } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/ui/vercel-navbar";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  Mail,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Clock,
  Crown,
  UserCog,
  User,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_CONFIG = {
  owner: { icon: Crown, label: "Owner", color: "text-amber-400" },
  admin: { icon: Shield, label: "Admin", color: "text-rose-400" },
  manager: { icon: UserCog, label: "Manager", color: "text-blue-400" },
  member: { icon: User, label: "Member", color: "text-green-400" },
  viewer: { icon: Eye, label: "Viewer", color: "text-neutral-400" },
};

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();
  const inviteCode = params.code as string;

  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "expired" | "accepted" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isAccepting, setIsAccepting] = useState(false);

  // Fetch invite details
  const inviteData = useQuery(api.organizations.getInviteByCode, { inviteCode });
  const acceptInvite = useMutation(api.organizations.acceptInvite);

  useEffect(() => {
    if (inviteData === undefined) {
      setStatus("loading");
    } else if (inviteData === null) {
      setStatus("invalid");
      setErrorMessage("This invite link is invalid or has already been used.");
    } else if (inviteData.invite.status !== "pending") {
      setStatus(inviteData.invite.status === "accepted" ? "accepted" : "invalid");
      setErrorMessage(
        inviteData.invite.status === "accepted"
          ? "This invite has already been accepted."
          : "This invite is no longer valid."
      );
    } else if (Date.now() > inviteData.invite.expiresAt) {
      setStatus("expired");
      setErrorMessage("This invite has expired. Please ask for a new invitation.");
    } else {
      setStatus("valid");
    }
  }, [inviteData]);

  const handleAcceptInvite = async () => {
    if (!user || !inviteData) return;

    setIsAccepting(true);
    try {
      const result = await acceptInvite({
        inviteCode,
      });

      if (result.success) {
        router.push(`/dashboard?org=${result.organizationId}&welcome=true`);
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to accept invite");
    } finally {
      setIsAccepting(false);
    }
  };

  const formatExpiry = (expiresAt: number) => {
    const now = Date.now();
    const diff = expiresAt - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} remaining`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} remaining`;
    return "Expires soon";
  };

  return (
    <div className="flex w-full flex-col min-h-screen bg-black">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: [
              "radial-gradient(80% 55% at 50% 52%, rgba(252,166,154,0.25) 0%, rgba(214,76,82,0.26) 27%, rgba(61,36,47,0.18) 47%, rgba(39,38,67,0.25) 60%, rgba(8,8,12,0.92) 78%, rgba(0,0,0,1) 88%)",
              "radial-gradient(85% 60% at 14% 0%, rgba(255,193,171,0.35) 0%, rgba(233,109,99,0.28) 30%, rgba(48,24,28,0.0) 64%)",
              "radial-gradient(70% 50% at 86% 22%, rgba(88,112,255,0.20) 0%, rgba(16,18,28,0.0) 55%)",
            ].join(","),
            backgroundColor: "#000",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.8)_0%,_transparent_100%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1">
        <Header />

        <div className="flex flex-1 items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            {/* Loading State */}
            {(status === "loading" || !userLoaded) && (
              <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 text-center">
                <Loader2 className="h-12 w-12 text-rose-500 animate-spin mx-auto mb-4" />
                <p className="text-neutral-400">Loading invite details...</p>
              </div>
            )}

            {/* Invalid/Expired/Error State */}
            {(status === "invalid" || status === "expired" || status === "error" || status === "accepted") && (
              <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 text-center">
                {status === "expired" ? (
                  <Clock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                ) : status === "accepted" ? (
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                ) : (
                  <XCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
                )}
                <h2 className="text-xl font-semibold text-white mb-2">
                  {status === "expired"
                    ? "Invite Expired"
                    : status === "accepted"
                    ? "Already Accepted"
                    : "Invalid Invite"}
                </h2>
                <p className="text-neutral-400 mb-6">{errorMessage}</p>
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="bg-rose-600 hover:bg-rose-700"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}

            {/* Valid Invite - Signed Out */}
            {status === "valid" && userLoaded && (
              <SignedOut>
                <div className="space-y-6">
                  {/* Invite Card */}
                  <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-4">
                        <Users className="h-8 w-8 text-rose-500" />
                      </div>
                      <h2 className="text-xl font-semibold text-white mb-1">
                        You&apos;re Invited!
                      </h2>
                      <p className="text-neutral-400 text-sm">
                        Sign in or create an account to join
                      </p>
                    </div>

                    {inviteData && (
                      <div className="space-y-3 mb-6">
                        {/* Organization */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-800/50">
                          <Building2 className="h-5 w-5 text-neutral-400" />
                          <div>
                            <p className="text-xs text-neutral-500">Organization</p>
                            <p className="text-white font-medium">
                              {inviteData.organization?.name}
                            </p>
                          </div>
                        </div>

                        {/* Role */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-800/50">
                          {(() => {
                            const config = ROLE_CONFIG[inviteData.invite.role];
                            const Icon = config.icon;
                            return (
                              <>
                                <Icon className={cn("h-5 w-5", config.color)} />
                                <div>
                                  <p className="text-xs text-neutral-500">Your Role</p>
                                  <p className={cn("font-medium", config.color)}>
                                    {config.label}
                                  </p>
                                </div>
                              </>
                            );
                          })()}
                        </div>

                        {/* Invited Email */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-800/50">
                          <Mail className="h-5 w-5 text-neutral-400" />
                          <div>
                            <p className="text-xs text-neutral-500">Invited Email</p>
                            <p className="text-white">{inviteData.invite.email}</p>
                          </div>
                        </div>

                        {/* Expiry */}
                        <div className="flex items-center justify-center gap-2 text-sm text-amber-500/80">
                          <Clock className="h-4 w-4" />
                          <span>{formatExpiry(inviteData.invite.expiresAt)}</span>
                        </div>

                        {/* Message */}
                        {inviteData.invite.message && (
                          <div className="p-3 rounded-xl bg-neutral-800/30 border border-neutral-700/50">
                            <p className="text-xs text-neutral-500 mb-1">Message</p>
                            <p className="text-neutral-300 text-sm italic">
                              &quot;{inviteData.invite.message}&quot;
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-neutral-500 justify-center">
                      <AlertCircle className="h-3 w-3" />
                      <span>Please sign in with the invited email address</span>
                    </div>
                  </div>

                  {/* Sign In */}
                  <SignIn
                    appearance={{
                      elements: {
                        rootBox: "mx-auto",
                        card: "backdrop-blur-xl bg-neutral-900/80 border border-neutral-800",
                      },
                      layout: {
                        socialButtonsPlacement: "top",
                        socialButtonsVariant: "blockButton",
                      },
                    }}
                    routing="hash"
                    signUpUrl="/sign-up"
                    forceRedirectUrl={`/invite/${inviteCode}`}
                  />
                </div>
              </SignedOut>
            )}

            {/* Valid Invite - Signed In */}
            {status === "valid" && userLoaded && (
              <SignedIn>
                <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-4">
                      <Users className="h-8 w-8 text-rose-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-1">
                      Join {inviteData?.organization?.name}
                    </h2>
                    <p className="text-neutral-400 text-sm">
                      You&apos;ve been invited to join the team
                    </p>
                  </div>

                  {inviteData && (
                    <div className="space-y-3 mb-6">
                      {/* Current User */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-800/50">
                        {user?.imageUrl ? (
                          <img
                            src={user.imageUrl}
                            alt=""
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center">
                            <User className="h-5 w-5 text-neutral-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {user?.fullName || user?.firstName || "You"}
                          </p>
                          <p className="text-neutral-500 text-sm">
                            {user?.primaryEmailAddress?.emailAddress}
                          </p>
                        </div>
                      </div>

                      {/* Email Match Warning */}
                      {user?.primaryEmailAddress?.emailAddress?.toLowerCase() !==
                        inviteData.invite.email.toLowerCase() && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="text-amber-500 font-medium">Email Mismatch</p>
                            <p className="text-amber-500/80">
                              This invite was sent to{" "}
                              <span className="font-medium">{inviteData.invite.email}</span>.
                              You&apos;re signed in with a different email.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Organization */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-800/50">
                        <Building2 className="h-5 w-5 text-neutral-400" />
                        <div>
                          <p className="text-xs text-neutral-500">Organization</p>
                          <p className="text-white font-medium">
                            {inviteData.organization?.name}
                          </p>
                        </div>
                      </div>

                      {/* Role */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-800/50">
                        {(() => {
                          const config = ROLE_CONFIG[inviteData.invite.role];
                          const Icon = config.icon;
                          return (
                            <>
                              <Icon className={cn("h-5 w-5", config.color)} />
                              <div>
                                <p className="text-xs text-neutral-500">Your Role</p>
                                <p className={cn("font-medium", config.color)}>
                                  {config.label}
                                </p>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* Expiry */}
                      <div className="flex items-center justify-center gap-2 text-sm text-amber-500/80">
                        <Clock className="h-4 w-4" />
                        <span>{formatExpiry(inviteData.invite.expiresAt)}</span>
                      </div>

                      {/* Message */}
                      {inviteData.invite.message && (
                        <div className="p-3 rounded-xl bg-neutral-800/30 border border-neutral-700/50">
                          <p className="text-xs text-neutral-500 mb-1">Message</p>
                          <p className="text-neutral-300 text-sm italic">
                            &quot;{inviteData.invite.message}&quot;
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-neutral-700 hover:bg-neutral-800"
                      onClick={() => router.push("/dashboard")}
                    >
                      Decline
                    </Button>
                    <Button
                      className="flex-1 bg-rose-600 hover:bg-rose-700"
                      onClick={handleAcceptInvite}
                      disabled={isAccepting}
                    >
                      {isAccepting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Accept & Join
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </SignedIn>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
