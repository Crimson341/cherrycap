"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Users,
  UserPlus,
  MoreHorizontal,
  Mail,
  Shield,
  ShieldCheck,
  Eye,
  Trash2,
  Crown,
  Clock,
  Check,
  Loader2,
  Building2,
  Copy,
} from "lucide-react";

// Role configuration
const ROLE_CONFIG = {
  owner: {
    label: "Owner",
    description: "Full control including billing",
    icon: Crown,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  admin: {
    label: "Admin",
    description: "Manage members and all features",
    icon: ShieldCheck,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  manager: {
    label: "Manager",
    description: "Manage team and most features",
    icon: Shield,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  member: {
    label: "Member",
    description: "Standard access",
    icon: Users,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  viewer: {
    label: "Viewer",
    description: "Read-only access",
    icon: Eye,
    color: "text-neutral-500",
    bgColor: "bg-neutral-500/10",
  },
} as const;

type Role = keyof typeof ROLE_CONFIG;
type InvitableRole = Exclude<Role, "owner">;

interface TeamManagementProps {
  organizationId: Id<"organizations">;
  currentUserId: string;
}

export function TeamManagement({ organizationId, currentUserId }: TeamManagementProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<InvitableRole>("member");
  const [inviteMessage, setInviteMessage] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<{ code: string } | null>(null);

  // Queries
  const organization = useQuery(api.organizations.get, { id: organizationId });
  const members = useQuery(api.organizations.getMembers, { organizationId });
  const pendingInvites = useQuery(api.organizations.getPendingInvites, { organizationId });
  const currentUserPermission = useQuery(api.organizations.checkPermission, {
    organizationId,
    userId: currentUserId,
    requiredRole: "admin",
  });

  // Mutations
  const inviteMember = useMutation(api.organizations.inviteMember);
  const removeMember = useMutation(api.organizations.removeMember);
  const updateMemberRole = useMutation(api.organizations.updateMemberRole);

  const canManageMembers = currentUserPermission?.allowed || organization?.ownerId === currentUserId;
  const isOwner = organization?.ownerId === currentUserId;

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      const result = await inviteMember({
        organizationId,
        email: inviteEmail.trim(),
        role: inviteRole,
        message: inviteMessage || undefined,
      });

      setInviteSuccess({ code: result.inviteCode });
      setInviteEmail("");
      setInviteMessage("");
    } catch (error) {
      console.error("Failed to invite:", error);
      alert(error instanceof Error ? error.message : "Failed to send invite");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      await removeMember({
        organizationId,
        targetUserId,
      });
    } catch (error) {
      console.error("Failed to remove member:", error);
      alert(error instanceof Error ? error.message : "Failed to remove member");
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: Exclude<Role, "owner">) => {
    try {
      await updateMemberRole({
        organizationId,
        targetUserId,
        newRole,
      });
    } catch (error) {
      console.error("Failed to update role:", error);
      alert(error instanceof Error ? error.message : "Failed to update role");
    }
  };

  const copyInviteLink = () => {
    if (!inviteSuccess) return;
    const link = `${window.location.origin}/invite/${inviteSuccess.code}`;
    navigator.clipboard.writeText(link);
  };

  if (!organization) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
      </div>
    );
  }

  const seatUsage = organization.currentSeats;
  const maxSeats = organization.maxSeats;
  const seatPercentage = maxSeats > 0 ? (seatUsage / maxSeats) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Manage your team and permissions
          </p>
        </div>

        {canManageMembers && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription className="text-neutral-400">
                  Send an invitation to join {organization.name}
                </DialogDescription>
              </DialogHeader>

              {inviteSuccess ? (
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-green-400">Invitation sent successfully!</span>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-neutral-400">Share this invite link</Label>
                    <div className="flex gap-2">
                      <Input
                        value={`${typeof window !== "undefined" ? window.location.origin : ""}/invite/${inviteSuccess.code}`}
                        readOnly
                        className="bg-neutral-800 border-neutral-700 text-neutral-300"
                      />
                      <Button variant="outline" onClick={copyInviteLink}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      setInviteSuccess(null);
                      setInviteDialogOpen(false);
                    }}
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="colleague@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="bg-neutral-800 border-neutral-700 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Role</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["admin", "manager", "member", "viewer"] as InvitableRole[]).map((role) => {
                          const config = ROLE_CONFIG[role];
                          const Icon = config.icon;
                          return (
                            <button
                              key={role}
                              onClick={() => setInviteRole(role)}
                              className={cn(
                                "p-3 rounded-lg border text-left transition-all",
                                inviteRole === role
                                  ? "border-rose-500 bg-rose-500/10"
                                  : "border-neutral-700 hover:border-neutral-600"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className={cn("h-4 w-4", config.color)} />
                                <span className="font-medium">{config.label}</span>
                              </div>
                              <p className="text-xs text-neutral-500 mt-1">
                                {config.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Personal Message (optional)</Label>
                      <Input
                        id="message"
                        placeholder="Hey! Join our team on CherryCap..."
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        className="bg-neutral-800 border-neutral-700 text-white"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setInviteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleInvite}
                      disabled={isInviting || !inviteEmail.trim()}
                      className="bg-gradient-to-r from-rose-500 to-red-600"
                    >
                      {isInviting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Invite
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Seat Usage */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-neutral-400">Seat Usage</span>
          <span className="text-sm font-medium text-white">
            {seatUsage} / {maxSeats === -1 ? "∞" : maxSeats} seats
          </span>
        </div>
        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              seatPercentage >= 90
                ? "bg-red-500"
                : seatPercentage >= 70
                ? "bg-amber-500"
                : "bg-gradient-to-r from-rose-500 to-red-500"
            )}
            style={{ width: `${Math.min(seatPercentage, 100)}%` }}
          />
        </div>
        {seatPercentage >= 80 && maxSeats !== -1 && (
          <p className="text-xs text-amber-400 mt-2">
            Running low on seats. Upgrade your plan to add more team members.
          </p>
        )}
      </div>

      {/* Members List */}
      <div className="space-y-2">
        {members?.map((member) => {
          const roleConfig = ROLE_CONFIG[member.role as Role];
          const RoleIcon = roleConfig.icon;
          const isCurrentUser = member.userId === currentUserId;
          const isMemberOwner = member.role === "owner";

          return (
            <div
              key={member._id}
              className="flex items-center justify-between p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="bg-neutral-800 text-white">
                    {member.name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">
                      {member.name || member.email}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm",
                    roleConfig.bgColor
                  )}
                >
                  <RoleIcon className={cn("h-3.5 w-3.5", roleConfig.color)} />
                  <span className={roleConfig.color}>{roleConfig.label}</span>
                </div>

                {canManageMembers && !isMemberOwner && !isCurrentUser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="bg-neutral-900 border-neutral-800"
                      align="end"
                    >
                      {isOwner && (
                        <>
                          <DropdownMenuItem
                            className="text-white hover:bg-neutral-800"
                            onClick={() => handleRoleChange(member.userId, "admin")}
                          >
                            <ShieldCheck className="h-4 w-4 mr-2 text-blue-500" />
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-white hover:bg-neutral-800"
                            onClick={() => handleRoleChange(member.userId, "manager")}
                          >
                            <Shield className="h-4 w-4 mr-2 text-purple-500" />
                            Make Manager
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-white hover:bg-neutral-800"
                            onClick={() => handleRoleChange(member.userId, "member")}
                          >
                            <Users className="h-4 w-4 mr-2 text-green-500" />
                            Make Member
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-white hover:bg-neutral-800"
                            onClick={() => handleRoleChange(member.userId, "viewer")}
                          >
                            <Eye className="h-4 w-4 mr-2 text-neutral-500" />
                            Make Viewer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-neutral-800" />
                        </>
                      )}
                      <DropdownMenuItem
                        className="text-red-400 hover:bg-neutral-800 hover:text-red-400"
                        onClick={() => handleRemoveMember(member.userId)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending Invites */}
      {pendingInvites && pendingInvites.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-400 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Invitations
          </h3>
          {pendingInvites.map((invite) => {
            const roleConfig = ROLE_CONFIG[invite.role as Role];
            const RoleIcon = roleConfig.icon;

            return (
              <div
                key={invite._id}
                className="flex items-center justify-between p-4 rounded-xl bg-neutral-900/50 border border-dashed border-neutral-700"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-neutral-800 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-neutral-500" />
                  </div>
                  <div>
                    <span className="font-medium text-neutral-300">{invite.email}</span>
                    <p className="text-xs text-neutral-500">
                      Expires {new Date(invite.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm",
                      roleConfig.bgColor
                    )}
                  >
                    <RoleIcon className={cn("h-3.5 w-3.5", roleConfig.color)} />
                    <span className={roleConfig.color}>{roleConfig.label}</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400">
                    Pending
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Organization Switcher Component
interface OrganizationSwitcherProps {
  currentUserId: string;
  currentOrgId?: Id<"organizations">;
  onSelect: (orgId: Id<"organizations">) => void;
}

export function OrganizationSwitcher({
  currentUserId,
  currentOrgId,
  onSelect,
}: OrganizationSwitcherProps) {
  const organizations = useQuery(api.organizations.listForUser, {});

  if (!organizations || organizations.length === 0) {
    return null;
  }

  const currentOrg = organizations.find((org) => org?._id === currentOrgId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="truncate">{currentOrg?.name || "Select Organization"}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-neutral-900 border-neutral-800">
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org?._id}
            className={cn(
              "text-white hover:bg-neutral-800",
              org?._id === currentOrgId && "bg-neutral-800"
            )}
            onClick={() => org && onSelect(org._id)}
          >
            <Building2 className="h-4 w-4 mr-2" />
            {org?.name}
            {org?._id === currentOrgId && <Check className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
