"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Settings,
  Users,
  Building2,
  Plus,
  Mail,
  Shield,
  Crown,
  UserCog,
  Eye,
  MoreVertical,
  Trash2,
  Copy,
  Check,
  Loader2,
  Clock,
  X,
  Sparkles,
  Palette,
  CreditCard,
  ChevronRight,
  Zap,
  BarChart3,
  MessageSquare,
  LinkIcon,
  UserPlus,
  ShieldCheck,
  Globe,
  Lock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

// Role configuration
const ROLE_CONFIG = {
  owner: { icon: Crown, label: "Owner", color: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20" },
  admin: { icon: Shield, label: "Admin", color: "text-rose-400", bgColor: "bg-rose-500/10", borderColor: "border-rose-500/20" },
  manager: { icon: UserCog, label: "Manager", color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20" },
  member: { icon: User, label: "Member", color: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/20" },
  viewer: { icon: Eye, label: "Viewer", color: "text-neutral-400", bgColor: "bg-neutral-500/10", borderColor: "border-neutral-500/20" },
};

// Plan configuration
const PLAN_CONFIG = {
  free: { label: "Free", color: "text-neutral-400", bgColor: "bg-neutral-500/10", seats: 1, icon: User },
  growth: { label: "Growth", color: "text-blue-400", bgColor: "bg-blue-500/10", seats: 5, icon: Zap },
  pro: { label: "Pro", color: "text-purple-400", bgColor: "bg-purple-500/10", seats: 25, icon: Sparkles },
  business: { label: "Business", color: "text-amber-400", bgColor: "bg-amber-500/10", seats: 100, icon: Building2 },
  enterprise: { label: "Enterprise", color: "text-rose-400", bgColor: "bg-rose-500/10", seats: -1, icon: Crown },
};

type Role = keyof typeof ROLE_CONFIG;
type Plan = keyof typeof PLAN_CONFIG;

// Create Organization Dialog
function CreateOrgDialog({
  open,
  onOpenChange,
  userId,
  userEmail,
  userName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
  userName?: string;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const createOrg = useMutation(api.organizations.create);

  const handleCreate = async () => {
    if (!name || !slug) return;
    setIsCreating(true);
    try {
      await createOrg({
        name,
        slug,
        ownerId: userId,
        ownerEmail: userEmail,
        ownerName: userName,
        plan: "free",
      });
      onOpenChange(false);
      setName("");
      setSlug("");
    } catch (error) {
      console.error("Failed to create organization:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-900 border-neutral-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Create Organization</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Set up a new workspace for your team
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label className="text-neutral-300 text-sm">Organization Name</Label>
            <Input
              placeholder="Acme Inc."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
              }}
              className="bg-neutral-800/50 border-neutral-700/50 h-11 focus:border-rose-500/50 focus:ring-rose-500/20"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-neutral-300 text-sm">URL Slug</Label>
            <div className="flex items-center">
              <span className="text-neutral-500 text-sm bg-neutral-800/30 px-3 h-11 flex items-center rounded-l-md border border-r-0 border-neutral-700/50">
                cherrycap.com/
              </span>
              <Input
                placeholder="acme-inc"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className="bg-neutral-800/50 border-neutral-700/50 h-11 rounded-l-none focus:border-rose-500/50 focus:ring-rose-500/20"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-neutral-400 hover:text-white">
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name || !slug || isCreating}
            className="bg-rose-600 hover:bg-rose-500 text-white px-6"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Invite Member Dialog
function InviteMemberDialog({
  open,
  onOpenChange,
  organizationId,
  inviterId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: Id<"organizations">;
  inviterId: string;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [message, setMessage] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  const inviteMember = useMutation(api.organizations.inviteMember);

  const handleInvite = async () => {
    if (!email) return;
    setIsInviting(true);
    try {
      const result = await inviteMember({
        organizationId,
        inviterId,
        email,
        role: role as "admin" | "manager" | "member" | "viewer",
        message: message || undefined,
      });
      setInviteLink(`${window.location.origin}/invite/${result.inviteCode}`);
    } catch (error) {
      console.error("Failed to invite member:", error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    onOpenChange(false);
    setEmail("");
    setRole("member");
    setMessage("");
    setInviteLink("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-neutral-900 border-neutral-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-rose-400" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Send an invitation to join your organization
          </DialogDescription>
        </DialogHeader>

        {!inviteLink ? (
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-neutral-300 text-sm">Email Address</Label>
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-neutral-800/50 border-neutral-700/50 h-11 focus:border-rose-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-300 text-sm">Role</Label>
              <Select value={role} onValueChange={(v: string) => setRole(v as Role)}>
                <SelectTrigger className="bg-neutral-800/50 border-neutral-700/50 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700">
                  <SelectItem value="admin">
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-rose-400" />
                      Admin - Full access
                    </span>
                  </SelectItem>
                  <SelectItem value="manager">
                    <span className="flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-blue-400" />
                      Manager - Team management
                    </span>
                  </SelectItem>
                  <SelectItem value="member">
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4 text-emerald-400" />
                      Member - Standard access
                    </span>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <span className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-neutral-400" />
                      Viewer - Read only
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-300 text-sm">Personal Message <span className="text-neutral-500">(optional)</span></Label>
              <Textarea
                placeholder="Looking forward to working together!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-neutral-800/50 border-neutral-700/50 h-20 resize-none focus:border-rose-500/50"
              />
            </div>
          </div>
        ) : (
          <div className="py-8">
            <div className="flex items-center justify-center mb-5">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center ring-4 ring-emerald-500/5">
                <Check className="h-7 w-7 text-emerald-400" />
              </div>
            </div>
            <p className="text-center text-neutral-300 mb-5 text-sm">
              Invitation created! Share this link:
            </p>
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly className="bg-neutral-800/50 border-neutral-700/50 text-sm font-mono" />
              <Button onClick={handleCopy} variant="outline" className="border-neutral-700 shrink-0 w-11">
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-neutral-500 mt-3 text-center flex items-center justify-center gap-1.5">
              <Clock className="h-3 w-3" />
              Link expires in 7 days
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          {!inviteLink ? (
            <>
              <Button variant="ghost" onClick={handleClose} className="text-neutral-400 hover:text-white">
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={!email || isInviting}
                className="bg-rose-600 hover:bg-rose-500 text-white px-6"
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
            </>
          ) : (
            <Button onClick={handleClose} className="bg-rose-600 hover:bg-rose-500 text-white w-full">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Organization Selector Item
function OrgSelectorItem({
  org,
  isSelected,
  onSelect,
}: {
  org: {
    _id: Id<"organizations">;
    name: string;
    slug: string;
    plan: string;
    currentSeats: number;
    maxSeats: number;
    brandColor?: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}) {
  const planConfig = PLAN_CONFIG[org.plan as Plan] || PLAN_CONFIG.free;
  const PlanIcon = planConfig.icon;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
        isSelected
          ? "bg-rose-500/10 text-white"
          : "hover:bg-neutral-800/50 text-neutral-400 hover:text-white"
      )}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: org.brandColor || "#e11d48" }}
      >
        <Building2 className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium text-sm truncate", isSelected && "text-white")}>
          {org.name}
        </p>
        <p className="text-xs text-neutral-500 truncate">
          {org.currentSeats}/{org.maxSeats === -1 ? "∞" : org.maxSeats} members
        </p>
      </div>
      <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-xs", planConfig.bgColor, planConfig.color)}>
        <PlanIcon className="h-3 w-3" />
        {planConfig.label}
      </div>
      {isSelected && <ChevronRight className="h-4 w-4 text-rose-400 shrink-0" />}
    </button>
  );
}

// Member Row
function MemberRow({
  member,
  isOwner,
  currentUserId,
  organizationId,
  ownerId,
}: {
  member: {
    _id: Id<"organizationMembers">;
    userId: string;
    email: string;
    name?: string;
    avatar?: string;
    role: string;
    joinedAt: number;
  };
  isOwner: boolean;
  currentUserId: string;
  organizationId: Id<"organizations">;
  ownerId: string;
}) {
  const [isRemoving, setIsRemoving] = useState(false);
  const removeMember = useMutation(api.organizations.removeMember);
  const updateRole = useMutation(api.organizations.updateMemberRole);

  const config = ROLE_CONFIG[member.role as Role] || ROLE_CONFIG.member;
  const Icon = config.icon;
  const isCurrentUser = member.userId === currentUserId;
  const isMemberOwner = member.userId === ownerId;
  const canManage = isOwner && !isCurrentUser && !isMemberOwner;

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeMember({
        organizationId,
        removerId: currentUserId,
        targetUserId: member.userId,
      });
    } catch (error) {
      console.error("Failed to remove member:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleRoleChange = async (newRole: string) => {
    try {
      await updateRole({
        organizationId,
        updaterId: currentUserId,
        targetUserId: member.userId,
        newRole: newRole as "admin" | "manager" | "member" | "viewer",
      });
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  return (
    <div className="flex items-center gap-4 py-3 group">
      <Avatar className="h-9 w-9 ring-2 ring-neutral-800">
        <AvatarImage src={member.avatar || ""} />
        <AvatarFallback className="bg-neutral-800 text-white text-sm">
          {member.name?.charAt(0) || member.email.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white font-medium text-sm truncate">
            {member.name || member.email.split("@")[0]}
          </p>
          {isCurrentUser && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500 uppercase tracking-wide font-medium">
              You
            </span>
          )}
        </div>
        <p className="text-neutral-500 text-xs truncate">{member.email}</p>
      </div>

      <div className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        config.bgColor, config.color, config.borderColor
      )}>
        <Icon className="h-3 w-3" />
        {config.label}
      </div>

      {canManage && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-neutral-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-neutral-900 border-neutral-800 min-w-[180px]" align="end">
            <DropdownMenuGroup>
              {(["admin", "manager", "member", "viewer"] as const).map((r) => {
                const roleConfig = ROLE_CONFIG[r];
                const RoleIcon = roleConfig.icon;
                return (
                  <DropdownMenuItem
                    key={r}
                    className="text-neutral-300 hover:bg-neutral-800"
                    onClick={() => handleRoleChange(r)}
                  >
                    <RoleIcon className={cn("h-4 w-4 mr-2", roleConfig.color)} />
                    Make {roleConfig.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-neutral-800" />
            <DropdownMenuItem
              className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Remove from team
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

// Pending Invite Row
function PendingInviteRow({
  invite,
  onRevoke,
}: {
  invite: {
    _id: Id<"organizationInvites">;
    email: string;
    role: string;
    createdAt: number;
    expiresAt: number;
  };
  onRevoke: () => void;
}) {
  const config = ROLE_CONFIG[invite.role as Role] || ROLE_CONFIG.member;
  const Icon = config.icon;
  const isExpired = Date.now() > invite.expiresAt;

  return (
    <div className="flex items-center gap-4 py-3 opacity-60 group">
      <div className="h-9 w-9 rounded-full bg-neutral-800/50 flex items-center justify-center ring-2 ring-dashed ring-neutral-700">
        <Mail className="h-4 w-4 text-neutral-500" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-neutral-300 font-medium text-sm truncate">{invite.email}</p>
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Clock className="h-3 w-3" />
          <span>Pending</span>
          {isExpired && (
            <>
              <span>•</span>
              <span className="text-amber-500">Expired</span>
            </>
          )}
        </div>
      </div>

      <div className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-dashed",
        config.bgColor, config.color, config.borderColor
      )}>
        <Icon className="h-3 w-3" />
        {config.label}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRevoke}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Stat Card
function StatCard({
  label,
  value,
  max,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  max: number;
  icon: LucideIcon;
  color: string;
}) {
  const percentage = max === -1 ? 0 : (value / max) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-neutral-400 text-sm">{label}</span>
        </div>
        <span className="text-white font-semibold">
          {value.toLocaleString()}
          <span className="text-neutral-500 font-normal">/{max === -1 ? "∞" : max.toLocaleString()}</span>
        </span>
      </div>
      <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color.replace("text-", "bg-"))}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

// Main Page Component
export default function TeamPage() {
  const { user } = useUser();
  const [selectedOrgId, setSelectedOrgId] = useState<Id<"organizations"> | null>(null);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [activeTab, setActiveTab] = useState<"members" | "settings" | "billing">("members");

  const organizations = useQuery(
    api.organizations.listForUser,
    user?.id ? { userId: user.id } : "skip"
  );

  const selectedOrg = organizations?.find((o) => o && o._id === selectedOrgId) || organizations?.[0] || null;

  const members = useQuery(
    api.organizations.getMembers,
    selectedOrg ? { organizationId: selectedOrg._id } : "skip"
  );

  const pendingInvites = useQuery(
    api.organizations.getPendingInvites,
    selectedOrg ? { organizationId: selectedOrg._id } : "skip"
  );

  const updateSettings = useMutation(api.organizations.updateSettings);

  const isOwner = selectedOrg?.ownerId === user?.id;
  const planConfig = PLAN_CONFIG[(selectedOrg?.plan || "free") as Plan];

  if (organizations && organizations.length > 0 && !selectedOrgId && organizations[0]) {
    setSelectedOrgId(organizations[0]._id);
  }

  const handleSettingChange = async (key: string, value: boolean) => {
    if (!selectedOrg || !user?.id) return;
    try {
      await updateSettings({
        organizationId: selectedOrg._id,
        userId: user.id,
        updates: {
          settings: { [key]: value },
        },
      });
    } catch (error) {
      console.error("Failed to update setting:", error);
    }
  };

  const tabs = [
    { id: "members" as const, label: "Members", icon: Users, count: members?.length },
    { id: "settings" as const, label: "Settings", icon: Settings },
    { id: "billing" as const, label: "Billing", icon: CreditCard },
  ];

  return (
    <>
      <div className="p-6 lg:p-8 overflow-auto min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Team</h1>
              <p className="text-neutral-500 text-sm mt-1">
                Manage your organizations and collaborate with your team
              </p>
            </div>
            <Button
              onClick={() => setShowCreateOrg(true)}
              className="bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-500/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Organization
            </Button>
          </div>

          {/* Main Container */}
          <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl overflow-hidden">
            <div className="flex divide-x divide-neutral-800/50">
              {/* Organizations Sidebar */}
              <div className="w-72 shrink-0 p-4 bg-neutral-900/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Organizations</h3>
                  <button
                    onClick={() => setShowCreateOrg(true)}
                    className="text-neutral-500 hover:text-rose-400 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {organizations?.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 rounded-xl bg-neutral-800/50 flex items-center justify-center mx-auto mb-3">
                      <Building2 className="h-6 w-6 text-neutral-600" />
                    </div>
                    <p className="text-neutral-500 text-sm mb-4">No organizations yet</p>
                    <Button
                      onClick={() => setShowCreateOrg(true)}
                      variant="outline"
                      size="sm"
                      className="border-neutral-700 text-neutral-300"
                    >
                      Create One
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {organizations?.filter(Boolean).map((org) => org && (
                      <OrgSelectorItem
                        key={org._id}
                        org={org}
                        isSelected={selectedOrg?._id === org._id}
                        onSelect={() => setSelectedOrgId(org._id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {selectedOrg ? (
                  <>
                    {/* Organization Header */}
                    <div className="p-6 border-b border-neutral-800/50 bg-gradient-to-r from-neutral-900/50 to-transparent">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                            style={{
                              backgroundColor: selectedOrg.brandColor || "#e11d48",
                              boxShadow: `0 8px 24px ${selectedOrg.brandColor || "#e11d48"}20`
                            }}
                          >
                            <Building2 className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-white">{selectedOrg.name}</h2>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-neutral-500 text-sm">/{selectedOrg.slug}</span>
                              <span className="text-neutral-700">•</span>
                              <span className={cn("text-sm font-medium flex items-center gap-1", planConfig.color)}>
                                <planConfig.icon className="h-3.5 w-3.5" />
                                {planConfig.label}
                              </span>
                            </div>
                          </div>
                        </div>
                        {isOwner && (
                          <Button
                            onClick={() => setShowInvite(true)}
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="px-6 pt-4 border-b border-neutral-800/50">
                      <div className="flex gap-1">
                        {tabs.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg relative",
                              activeTab === tab.id
                                ? "text-white bg-neutral-800/50"
                                : "text-neutral-500 hover:text-neutral-300"
                            )}
                          >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                            {tab.count !== undefined && (
                              <span className={cn(
                                "px-1.5 py-0.5 rounded text-xs",
                                activeTab === tab.id
                                  ? "bg-neutral-700 text-neutral-300"
                                  : "bg-neutral-800/50 text-neutral-500"
                              )}>
                                {tab.count}
                              </span>
                            )}
                            {activeTab === tab.id && (
                              <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                      <AnimatePresence mode="wait">
                        {activeTab === "members" && (
                          <motion.div
                            key="members"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                          >
                            {/* Members List */}
                            <div className="divide-y divide-neutral-800/30">
                              {members?.map((member) => (
                                <MemberRow
                                  key={member._id}
                                  member={member}
                                  isOwner={isOwner}
                                  currentUserId={user?.id || ""}
                                  organizationId={selectedOrg._id}
                                  ownerId={selectedOrg.ownerId}
                                />
                              ))}
                            </div>

                            {/* Pending Invites */}
                            {pendingInvites && pendingInvites.length > 0 && (
                              <div className="mt-6 pt-6 border-t border-neutral-800/30">
                                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  Pending Invites
                                </h4>
                                <div className="divide-y divide-neutral-800/30">
                                  {pendingInvites.map((invite) => (
                                    <PendingInviteRow
                                      key={invite._id}
                                      invite={invite}
                                      onRevoke={() => {}}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Empty State */}
                            {(!members || members.length === 0) && (
                              <div className="text-center py-16">
                                <div className="w-16 h-16 rounded-2xl bg-neutral-800/50 flex items-center justify-center mx-auto mb-4">
                                  <Users className="h-8 w-8 text-neutral-600" />
                                </div>
                                <p className="text-neutral-400 mb-4">No team members yet</p>
                                {isOwner && (
                                  <Button
                                    onClick={() => setShowInvite(true)}
                                    className="bg-rose-600 hover:bg-rose-500"
                                  >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Invite your first member
                                  </Button>
                                )}
                              </div>
                            )}
                          </motion.div>
                        )}

                        {activeTab === "settings" && (
                          <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-8"
                          >
                            {/* Organization Info */}
                            <div>
                              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                <Globe className="h-4 w-4 text-neutral-500" />
                                General
                              </h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">Name</Label>
                                  <Input
                                    defaultValue={selectedOrg.name}
                                    className="bg-neutral-800/30 border-neutral-700/50 h-10"
                                    disabled={!isOwner}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">URL Slug</Label>
                                  <div className="flex items-center">
                                    <span className="text-neutral-600 text-sm bg-neutral-800/30 px-3 h-10 flex items-center rounded-l-md border border-r-0 border-neutral-700/50">
                                      /
                                    </span>
                                    <Input
                                      value={selectedOrg.slug}
                                      className="bg-neutral-800/30 border-neutral-700/50 h-10 rounded-l-none"
                                      disabled
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Branding */}
                            <div>
                              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                <Palette className="h-4 w-4 text-rose-400" />
                                Branding
                              </h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">Logo URL</Label>
                                  <div className="flex items-center">
                                    <span className="text-neutral-600 text-sm bg-neutral-800/30 px-3 h-10 flex items-center rounded-l-md border border-r-0 border-neutral-700/50">
                                      <LinkIcon className="h-4 w-4" />
                                    </span>
                                    <Input
                                      defaultValue={selectedOrg.logo || ""}
                                      placeholder="https://..."
                                      className="bg-neutral-800/30 border-neutral-700/50 h-10 rounded-l-none"
                                      disabled={!isOwner}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">Brand Color</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      defaultValue={selectedOrg.brandColor || "#e11d48"}
                                      className="bg-neutral-800/30 border-neutral-700/50 h-10 flex-1 font-mono"
                                      disabled={!isOwner}
                                    />
                                    <div
                                      className="w-10 h-10 rounded-lg border border-neutral-700/50 shrink-0"
                                      style={{ backgroundColor: selectedOrg.brandColor || "#e11d48" }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Team Settings */}
                            <div>
                              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-blue-400" />
                                Permissions
                              </h3>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-neutral-800/20 border border-neutral-800/30">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                      <UserPlus className="h-4 w-4 text-emerald-400" />
                                    </div>
                                    <div>
                                      <p className="text-white text-sm font-medium">Allow member invites</p>
                                      <p className="text-neutral-500 text-xs">Managers can invite new team members</p>
                                    </div>
                                  </div>
                                  <Switch
                                    checked={selectedOrg.settings?.allowMemberInvites ?? true}
                                    onCheckedChange={(v) => handleSettingChange("allowMemberInvites", v)}
                                    disabled={!isOwner}
                                  />
                                </div>
                                <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-neutral-800/20 border border-neutral-800/30">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                      <Lock className="h-4 w-4 text-amber-400" />
                                    </div>
                                    <div>
                                      <p className="text-white text-sm font-medium">Require approval</p>
                                      <p className="text-neutral-500 text-xs">Admin must approve new members</p>
                                    </div>
                                  </div>
                                  <Switch
                                    checked={selectedOrg.settings?.requireApproval ?? false}
                                    onCheckedChange={(v) => handleSettingChange("requireApproval", v)}
                                    disabled={!isOwner}
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {activeTab === "billing" && (
                          <motion.div
                            key="billing"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-6"
                          >
                            {/* Plan Overview */}
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <div className={cn("px-3 py-1.5 rounded-lg flex items-center gap-2", planConfig.bgColor)}>
                                    <planConfig.icon className={cn("h-4 w-4", planConfig.color)} />
                                    <span className={cn("font-semibold", planConfig.color)}>
                                      {planConfig.label} Plan
                                    </span>
                                  </div>
                                </div>
                                <p className="text-neutral-500 text-sm">
                                  Manage your subscription and usage
                                </p>
                              </div>
                              <Button className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-lg shadow-rose-500/20">
                                <Sparkles className="h-4 w-4 mr-2" />
                                Upgrade
                              </Button>
                            </div>

                            {/* Usage Stats */}
                            <div className="grid grid-cols-3 gap-4">
                              <div className="p-4 rounded-xl bg-neutral-800/20 border border-neutral-800/30">
                                <StatCard
                                  label="Seats"
                                  value={selectedOrg.currentSeats}
                                  max={selectedOrg.maxSeats}
                                  icon={Users}
                                  color="text-rose-400"
                                />
                              </div>
                              <div className="p-4 rounded-xl bg-neutral-800/20 border border-neutral-800/30">
                                <StatCard
                                  label="Pageviews"
                                  value={selectedOrg.currentMonthPageviews || 0}
                                  max={selectedOrg.monthlyPageviewLimit || 0}
                                  icon={BarChart3}
                                  color="text-blue-400"
                                />
                              </div>
                              <div className="p-4 rounded-xl bg-neutral-800/20 border border-neutral-800/30">
                                <StatCard
                                  label="AI Queries"
                                  value={selectedOrg.currentMonthAiQueries || 0}
                                  max={selectedOrg.monthlyAiQueryLimit || 0}
                                  icon={MessageSquare}
                                  color="text-purple-400"
                                />
                              </div>
                            </div>

                            {/* Pricing Tiers */}
                            <div>
                              <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                                Per-Seat Pricing
                              </h4>
                              <div className="grid grid-cols-4 gap-3">
                                {(["growth", "pro", "business", "enterprise"] as const).map((plan) => {
                                  const config = PLAN_CONFIG[plan];
                                  const prices = { growth: 15, pro: 12, business: 10, enterprise: 8 };
                                  return (
                                    <div
                                      key={plan}
                                      className="p-4 rounded-xl bg-neutral-800/20 border border-neutral-800/30 text-center hover:border-neutral-700/50 transition-colors"
                                    >
                                      <config.icon className={cn("h-5 w-5 mx-auto mb-2", config.color)} />
                                      <p className={cn("font-medium text-sm mb-1", config.color)}>
                                        {config.label}
                                      </p>
                                      <p className="text-xl font-bold text-white">${prices[plan]}</p>
                                      <p className="text-neutral-500 text-xs">per seat/mo</p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-[500px]">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-neutral-800/50 flex items-center justify-center mx-auto mb-4">
                        <Building2 className="h-8 w-8 text-neutral-600" />
                      </div>
                      <p className="text-neutral-400 mb-4">Select or create an organization</p>
                      <Button
                        onClick={() => setShowCreateOrg(true)}
                        className="bg-rose-600 hover:bg-rose-500"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Organization
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CreateOrgDialog
        open={showCreateOrg}
        onOpenChange={setShowCreateOrg}
        userId={user?.id || ""}
        userEmail={user?.primaryEmailAddress?.emailAddress || ""}
        userName={user?.fullName || user?.firstName || undefined}
      />

      {selectedOrg && (
        <InviteMemberDialog
          open={showInvite}
          onOpenChange={setShowInvite}
          organizationId={selectedOrg._id}
          inviterId={user?.id || ""}
        />
      )}
    </>
  );
}
