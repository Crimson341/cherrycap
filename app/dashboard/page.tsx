"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Camera,
  Loader2,
  AlertTriangle,
  Cherry,
  Mail,
  AtSign,
  Shield,
  Bell,
  Trash2,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { user } = useUser();
  const clerk = useClerk();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Editing states
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState({ first: "", last: "" });
  const [isSaving, setIsSaving] = useState(false);

  const profile = useQuery(api.userProfiles.get, { userId: user?.id || "" });
  const updateProfile = useMutation(api.userProfiles.upsert);
  const currentUsername = useQuery(api.usernames.getUsername, { userId: user?.id || "" });

  const isVerified = profile?.isVerified ?? false;
  const [notifications, setNotifications] = useState({ email: true, push: true });

  useEffect(() => {
    if (user) {
      setNameValue({ first: user.firstName || "", last: user.lastName || "" });
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setNotifications({
        email: profile.emailNotifications ?? true,
        push: profile.pushNotifications ?? true,
      });
    }
  }, [profile]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      setIsUploading(true);
      try {
        await user.setProfileImage({ file });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const saveName = async () => {
    setIsSaving(true);
    try {
      await user?.update({ firstName: nameValue.first, lastName: nameValue.last });
      setEditingName(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotification = async (key: "email" | "push", value: boolean) => {
    setNotifications((p) => ({ ...p, [key]: value }));
    await updateProfile({
      [key === "email" ? "emailNotifications" : "pushNotifications"]: value,
    });
  };

  const handleDelete = async () => {
    if (deleteConfirm !== "DELETE") return;
    setIsDeleting(true);
    try {
      await user?.delete();
    } catch {
      setIsDeleting(false);
    }
  };

  const copyUsername = () => {
    if (currentUsername?.username) {
      navigator.clipboard.writeText(`@${currentUsername.username}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900/50 rounded-2xl border border-neutral-800/50 overflow-hidden"
        >
          {/* Cover / Header Area */}
          <div className="h-24 bg-gradient-to-br from-rose-500/20 via-pink-500/10 to-neutral-900" />

          {/* Avatar & Basic Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              {/* Avatar */}
              <div className="relative group shrink-0">
                <Avatar className="h-24 w-24 ring-4 ring-neutral-900 bg-neutral-800">
                  <AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
                  <AvatarFallback className="bg-neutral-800 text-white text-2xl font-medium">
                    {user?.firstName?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                >
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <Camera className="h-5 w-5 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {isVerified && (
                  <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-rose-500 flex items-center justify-center ring-4 ring-neutral-900">
                    <Cherry className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              {/* Name & Username */}
              <div className="flex-1 min-w-0 sm:pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-semibold text-white">
                    {user?.fullName || "Your Name"}
                  </h1>
                  {isVerified && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-rose-500/10 text-rose-400 rounded-full">
                      Verified
                    </span>
                  )}
                </div>
                {currentUsername?.username && (
                  <button
                    onClick={copyUsername}
                    className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-300 transition-colors mt-0.5 group"
                  >
                    <span>@{currentUsername.username}</span>
                    {copied ? (
                      <Check className="h-3 w-3 text-green-400" />
                    ) : (
                      <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                )}
              </div>

              {/* Get Verified CTA */}
              {!isVerified && (
                <Link href="/verify">
                  <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white h-8 px-4 text-xs font-medium">
                    <Cherry className="h-3.5 w-3.5 mr-1.5" />
                    Get Verified
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-neutral-900/50 rounded-2xl border border-neutral-800/50"
        >
          <div className="px-5 py-3 border-b border-neutral-800/50">
            <h2 className="text-sm font-medium text-neutral-400">Account</h2>
          </div>

          {/* Name Row */}
          <div className="px-5 py-4 border-b border-neutral-800/50">
            {editingName ? (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Input
                    value={nameValue.first}
                    onChange={(e) => setNameValue((p) => ({ ...p, first: e.target.value }))}
                    placeholder="First"
                    className="bg-neutral-800/50 border-neutral-700/50 text-white h-9"
                  />
                  <Input
                    value={nameValue.last}
                    onChange={(e) => setNameValue((p) => ({ ...p, last: e.target.value }))}
                    placeholder="Last"
                    className="bg-neutral-800/50 border-neutral-700/50 text-white h-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveName} disabled={isSaving} size="sm" className="bg-rose-500 hover:bg-rose-600 h-7 px-3 text-xs">
                    {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                  </Button>
                  <Button onClick={() => setEditingName(false)} variant="ghost" size="sm" className="text-neutral-500 h-7 px-3 text-xs">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-neutral-800/50 flex items-center justify-center">
                    <AtSign className="h-4 w-4 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Name</p>
                    <p className="text-sm text-white">{user?.fullName || "Not set"}</p>
                  </div>
                </div>
                <button onClick={() => setEditingName(true)} className="text-xs text-rose-400 hover:text-rose-300 font-medium">
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Email Row */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-neutral-800/50 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-neutral-500" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Email</p>
                  <p className="text-sm text-white">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>
              <button onClick={() => clerk.openUserProfile()} className="text-xs text-rose-400 hover:text-rose-300 font-medium">
                Change
              </button>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-neutral-900/50 rounded-2xl border border-neutral-800/50"
        >
          <div className="px-5 py-3 border-b border-neutral-800/50">
            <h2 className="text-sm font-medium text-neutral-400">Notifications</h2>
          </div>

          <div className="px-5 py-4 border-b border-neutral-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-neutral-800/50 flex items-center justify-center">
                <Bell className="h-4 w-4 text-neutral-500" />
              </div>
              <div>
                <p className="text-sm text-white">Email notifications</p>
                <p className="text-xs text-neutral-500">Updates via email</p>
              </div>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(v) => handleNotification("email", v)}
              className="data-[state=checked]:bg-rose-500"
            />
          </div>

          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-neutral-800/50 flex items-center justify-center">
                <Bell className="h-4 w-4 text-neutral-500" />
              </div>
              <div>
                <p className="text-sm text-white">Push notifications</p>
                <p className="text-xs text-neutral-500">Alerts on device</p>
              </div>
            </div>
            <Switch
              checked={notifications.push}
              onCheckedChange={(v) => handleNotification("push", v)}
              className="data-[state=checked]:bg-rose-500"
            />
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-neutral-900/50 rounded-2xl border border-neutral-800/50"
        >
          <div className="px-5 py-3 border-b border-neutral-800/50">
            <h2 className="text-sm font-medium text-neutral-400">Security</h2>
          </div>

          <button
            onClick={() => clerk.openUserProfile()}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-neutral-800/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-neutral-800/50 flex items-center justify-center">
                <Shield className="h-4 w-4 text-neutral-500" />
              </div>
              <div className="text-left">
                <p className="text-sm text-white">Password & Security</p>
                <p className="text-xs text-neutral-500">Manage password, 2FA, sessions</p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-neutral-600" />
          </button>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-red-500/5 rounded-2xl border border-red-500/10"
        >
          <div className="px-5 py-3 border-b border-red-500/10">
            <h2 className="text-sm font-medium text-red-400/80">Danger Zone</h2>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-red-500/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-red-400/70" />
              </div>
              <div className="text-left">
                <p className="text-sm text-red-400">Delete account</p>
                <p className="text-xs text-neutral-500">Permanently delete all data</p>
              </div>
            </div>
          </button>
        </motion.div>
      </div>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-neutral-900 border-neutral-800 text-white sm:max-w-md">
          <DialogHeader>
            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <DialogTitle>Delete account?</DialogTitle>
            <DialogDescription className="text-neutral-400">
              This is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm text-neutral-400 mb-2 block">
              Type <span className="font-mono bg-neutral-800 px-1.5 py-0.5 rounded text-white">DELETE</span> to confirm
            </label>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-white"
              placeholder="DELETE"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)} className="text-neutral-400">
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteConfirm !== "DELETE" || isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
