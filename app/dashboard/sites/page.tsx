"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Globe,
  Copy,
  Check,
  Trash2,
  Code,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

// Admin email(s) - only these users can see the tracking code
const ADMIN_EMAILS = ["your-email@example.com"]; // UPDATE THIS WITH YOUR EMAIL

export default function SitesPage() {
  const { user } = useUser();
  const sites = useQuery(api.sites.getUserSites);
  const createSite = useMutation(api.sites.createSite);
  const deleteSite = useMutation(api.sites.deleteSite);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState<string | null>(null);
  const [newSiteName, setNewSiteName] = useState("");
  const [newSiteDomain, setNewSiteDomain] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Check if current user is admin
  const isAdmin = user?.primaryEmailAddress?.emailAddress && 
    ADMIN_EMAILS.includes(user.primaryEmailAddress.emailAddress);

  const handleCreateSite = async () => {
    if (!newSiteName || !newSiteDomain) return;
    
    setIsCreating(true);
    try {
      await createSite({ name: newSiteName, domain: newSiteDomain });
      setNewSiteName("");
      setNewSiteDomain("");
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to create site:", error);
    }
    setIsCreating(false);
  };

  const handleDeleteSite = async (id: string) => {
    if (!confirm("Are you sure you want to delete this site? All tracking data will be lost.")) {
      return;
    }
    try {
      await deleteSite({ id: id as any });
    } catch (error) {
      console.error("Failed to delete site:", error);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTrackingCode = (siteId: string, siteDomain: string) => {
    const scriptUrl = typeof window !== "undefined" 
      ? window.location.origin + "/api/script"
      : "https://cherrycap.com/api/script";
    
    return `<!-- CherryCap Analytics for ${siteDomain} -->
<script src="${scriptUrl}" data-site-id="${siteId}" defer></script>

<!-- 
  ELEMENT TRACKING OPTIONS:
  
  Track button/link clicks:
  <button data-cc-track="click" data-cc-name="signup-btn">Sign Up</button>
  
  Track gallery:
  <div data-cc-track="gallery" data-cc-name="portfolio">
    <img data-cc-track="gallery-item" data-cc-id="photo-1" src="..." />
  </div>
  
  Track forms:
  <form data-cc-track="form" data-cc-name="contact">...</form>
  
  Track sections (scroll into view):
  <section data-cc-track="section" data-cc-name="pricing">...</section>
  
  Track downloads:
  <a data-cc-track="download" data-cc-name="brochure" href="file.pdf">Download</a>
  
  Track videos:
  <video data-cc-track="video" data-cc-name="intro">...</video>
-->`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-semibold text-white">
                {isAdmin ? "Manage Sites" : "Your Sites"}
              </h1>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-medium">
                  Admin
                </span>
              )}
            </div>
            <p className="text-neutral-400">
              {isAdmin 
                ? "Add and manage client websites with tracking" 
                : "View analytics for your tracked websites"}
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Site
            </Button>
          )}
        </div>

        {/* Sites Grid */}
        {sites === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 animate-pulse">
                <div className="h-6 bg-neutral-800 rounded w-1/2 mb-4" />
                <div className="h-4 bg-neutral-800 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : sites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-800 flex items-center justify-center">
              <Globe className="h-8 w-8 text-neutral-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No sites yet</h2>
            <p className="text-neutral-400 mb-6">
              {isAdmin 
                ? "Add your first client website to start tracking" 
                : "No websites are being tracked for your account yet"}
            </p>
            {isAdmin && (
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Site
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sites.map((site, index) => (
              <motion.div
                key={site._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/20 to-red-600/20 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-rose-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{site.name}</h3>
                      <p className="text-sm text-neutral-400">{site.domain}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    site.isActive 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-neutral-800 text-neutral-500"
                  }`}>
                    {site.isActive ? "Active" : "Paused"}
                  </div>
                </div>

                {/* Site ID - Show to all users */}
                <div className="mb-4 p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">Site ID</div>
                      <code className="text-sm text-rose-400">{site.siteId}</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(site.siteId, site.siteId)}
                      className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
                      title="Copy Site ID"
                    >
                      {copiedId === site.siteId ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-neutral-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent border-neutral-800 hover:bg-neutral-800 text-white"
                    onClick={() => setShowCodeModal(site.siteId + '|' + site.domain)}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Get Code
                  </Button>
                  <Link href={`/dashboard?site=${site.siteId}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent border-neutral-800 hover:bg-neutral-800 text-white"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </Link>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteSite(site._id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors"
                      title="Delete site"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Site Modal - Admin Only */}
      {showAddModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md p-6 rounded-xl bg-neutral-900 border border-neutral-800"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Add Client Site</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Client/Site Name</label>
                <input
                  type="text"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  placeholder="Acme Photography"
                  className="w-full px-4 py-3 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Domain</label>
                <input
                  type="text"
                  value={newSiteDomain}
                  onChange={(e) => setNewSiteDomain(e.target.value)}
                  placeholder="acmephoto.com"
                  className="w-full px-4 py-3 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1 bg-transparent border-neutral-800 hover:bg-neutral-800 text-white"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700"
                onClick={handleCreateSite}
                disabled={!newSiteName || !newSiteDomain || isCreating}
              >
                {isCreating ? "Creating..." : "Create Site"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tracking Code Modal - Available to all users */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCodeModal(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-3xl p-6 rounded-xl bg-neutral-900 border border-neutral-800 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold text-white mb-2">Tracking Code</h2>
            <p className="text-neutral-400 mb-4">
              Add this to the client's website <code className="text-rose-400">&lt;head&gt;</code> tag
            </p>
            
            <div className="relative">
              <pre className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 overflow-x-auto text-sm">
                <code className="text-neutral-300 whitespace-pre-wrap">
                  {getTrackingCode(
                    showCodeModal.split('|')[0], 
                    showCodeModal.split('|')[1]
                  )}
                </code>
              </pre>
              <button
                onClick={() => copyToClipboard(
                  getTrackingCode(showCodeModal.split('|')[0], showCodeModal.split('|')[1]), 
                  'code'
                )}
                className="absolute top-3 right-3 p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
              >
                {copiedId === 'code' ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4 text-neutral-400" />
                )}
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h3 className="text-sm font-medium text-blue-400 mb-2">Auto-tracked</h3>
                <ul className="text-sm text-neutral-300 space-y-1">
                  <li>• Page views & navigation</li>
                  <li>• Session duration</li>
                  <li>• Bounce rate</li>
                  <li>• Traffic sources</li>
                  <li>• Device & browser</li>
                  <li>• Page performance</li>
                  <li>• Scroll depth</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <h3 className="text-sm font-medium text-purple-400 mb-2">Element Tracking</h3>
                <ul className="text-sm text-neutral-300 space-y-1">
                  <li>• Button/link clicks</li>
                  <li>• Gallery views & clicks</li>
                  <li>• Form submissions</li>
                  <li>• Video plays</li>
                  <li>• File downloads</li>
                  <li>• Section visibility</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                className="bg-transparent border-neutral-800 hover:bg-neutral-800 text-white"
                onClick={() => setShowCodeModal(null)}
              >
                Done
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
