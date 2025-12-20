"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import {
  Shield,
  ChevronLeft,
  Cherry,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  User,
  Globe,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  Loader2,
  Filter,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

type RequestStatus = "pending" | "approved" | "rejected";

export default function AdminDashboardPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("pending");
  const [selectedRequest, setSelectedRequest] = useState<Id<"verificationRequests"> | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Queries
  const isAdmin = useQuery(api.verification.isAdmin);
  const { requests, isAdmin: hasAccess } = useQuery(
    api.verification.listAllRequests,
    statusFilter === "all" ? {} : { status: statusFilter as RequestStatus }
  ) ?? { requests: [], isAdmin: false };

  // Mutations
  const approveRequest = useMutation(api.verification.adminApprove);
  const rejectRequest = useMutation(api.verification.adminReject);

  const handleApprove = async (requestId: Id<"verificationRequests">) => {
    setIsProcessing(true);
    try {
      await approveRequest({ requestId });
      setSelectedRequest(null);
    } catch (error) {
      console.error("Failed to approve:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (requestId: Id<"verificationRequests">) => {
    setIsProcessing(true);
    try {
      await rejectRequest({ requestId, reason: rejectReason || undefined });
      setSelectedRequest(null);
      setRejectReason("");
    } catch (error) {
      console.error("Failed to reject:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getBusinessTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      company: "Company",
      creator: "Creator",
      agency: "Agency",
      nonprofit: "Nonprofit",
      other: "Other",
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case "approved":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">
            <CheckCircle className="h-3 w-3" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  // Loading state
  if (!isLoaded || isAdmin === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <Shield className="h-16 w-16 text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-neutral-400 mb-6">Sign in to access admin features</p>
        <Link
          href="/login"
          className="px-6 py-2 bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Not an admin
  if (!isAdmin || !hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-neutral-400 mb-6">You don&apos;t have permission to access this page</p>
        <Link
          href="/dashboard"
          className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const selectedRequestData = requests.find(r => r._id === selectedRequest);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-neutral-400 hover:text-white">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-rose-500" />
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Cherry className="h-5 w-5 text-rose-500" />
            <span className="text-sm text-neutral-400">Verification Requests</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="h-4 w-4 text-neutral-500" />
          <div className="flex gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-lg transition-colors",
                  statusFilter === status
                    ? "bg-rose-500 text-white"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                )}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <span className="ml-auto text-sm text-neutral-500">
            {requests.length} request{requests.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Requests Grid */}
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
            <Cherry className="h-12 w-12 mb-4" />
            <p>No {statusFilter !== "all" ? statusFilter : ""} verification requests</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((request) => (
              <div
                key={request._id}
                className={cn(
                  "p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-colors cursor-pointer",
                  selectedRequest === request._id && "border-rose-500/50 ring-1 ring-rose-500/20"
                )}
                onClick={() => setSelectedRequest(selectedRequest === request._id ? null : request._id)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold">
                      {request.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{request.fullName}</h3>
                      <p className="text-xs text-neutral-500">{request.email}</p>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                {/* Business Info */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-neutral-500" />
                    <span className="text-neutral-300">{request.businessName}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-neutral-800 text-neutral-400 rounded">
                      {getBusinessTypeLabel(request.businessType)}
                    </span>
                  </div>
                  {request.website && (
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                      <Globe className="h-4 w-4 text-neutral-500" />
                      <a
                        href={request.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-rose-400 truncate flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {request.website.replace(/^https?:\/\//, "")}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {(request.city || request.country) && (
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                      <MapPin className="h-4 w-4 text-neutral-500" />
                      <span>
                        {[request.city, request.state, request.country].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description preview */}
                <p className="text-xs text-neutral-500 line-clamp-2 mb-3">
                  {request.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                  {request.status === "pending" && (
                    <span className="text-amber-400">Needs review</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Panel (when request is selected) */}
        {selectedRequestData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 border border-neutral-800 rounded-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                    {selectedRequestData.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{selectedRequestData.fullName}</h2>
                    <p className="text-sm text-neutral-400">{selectedRequestData.businessName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 space-y-6">
                {/* Status */}
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedRequestData.status)}
                  {selectedRequestData.reviewedAt && (
                    <span className="text-xs text-neutral-500">
                      Reviewed {new Date(selectedRequestData.reviewedAt).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-neutral-300">Contact Information</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-neutral-500" />
                      <a href={`mailto:${selectedRequestData.email}`} className="text-rose-400 hover:underline">
                        {selectedRequestData.email}
                      </a>
                    </div>
                    {selectedRequestData.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-neutral-500" />
                        <span className="text-neutral-300">{selectedRequestData.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Info */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-neutral-300">Business Information</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-neutral-500" />
                      <span className="text-neutral-300">{selectedRequestData.businessName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-neutral-500" />
                      <span className="text-neutral-300">{getBusinessTypeLabel(selectedRequestData.businessType)}</span>
                    </div>
                    {selectedRequestData.industry && (
                      <div className="text-sm text-neutral-400">
                        Industry: {selectedRequestData.industry}
                      </div>
                    )}
                    {selectedRequestData.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-neutral-500" />
                        <a
                          href={selectedRequestData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-rose-400 hover:underline flex items-center gap-1"
                        >
                          {selectedRequestData.website}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                {(selectedRequestData.city || selectedRequestData.country) && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-neutral-300">Location</h3>
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                      <MapPin className="h-4 w-4 text-neutral-500" />
                      <span>
                        {[selectedRequestData.city, selectedRequestData.state, selectedRequestData.country].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-neutral-300">Description</h3>
                  <p className="text-sm text-neutral-400 whitespace-pre-wrap">
                    {selectedRequestData.description}
                  </p>
                </div>

                {/* Social Links */}
                {selectedRequestData.socialLinks && selectedRequestData.socialLinks.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-neutral-300">Social Links</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequestData.socialLinks.map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-2 py-1 bg-neutral-800 text-rose-400 hover:bg-neutral-700 rounded flex items-center gap-1"
                        >
                          {link.replace(/^https?:\/\//, "").split("/")[0]}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejection Reason (if rejected) */}
                {selectedRequestData.status === "rejected" && selectedRequestData.rejectionReason && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <h3 className="text-sm font-semibold text-red-400 mb-1">Rejection Reason</h3>
                    <p className="text-sm text-red-300">{selectedRequestData.rejectionReason}</p>
                  </div>
                )}

                {/* Actions (only for pending) */}
                {selectedRequestData.status === "pending" && (
                  <div className="space-y-4 pt-4 border-t border-neutral-800">
                    <div className="space-y-2">
                      <label className="text-sm text-neutral-400">
                        Rejection reason (optional)
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter a reason if rejecting..."
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(selectedRequestData._id)}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(selectedRequestData._id)}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" />
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submitted date */}
                <div className="text-xs text-neutral-500 pt-2 border-t border-neutral-800">
                  Submitted {new Date(selectedRequestData.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
