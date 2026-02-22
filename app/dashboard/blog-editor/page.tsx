"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { BlogEditor } from "@/components/editor/blog-editor";
import { SEOSidebar } from "@/components/editor/seo-sidebar";
import { cn } from "@/lib/utils";
import {
  FileText,
  Plus,
  Trash2,
  Save,
  ChevronLeft,
  Menu,
  PanelRightClose,
  PanelRight,
  Clock,
  Loader2,
  X,
  Cherry,
  AlertCircle,
  Send,
  Calendar,
  Image as ImageIcon,
  Eye,
  History,
  Tag,
  FolderOpen,
  Flame,
  Sparkles,
  RotateCcw,
  Keyboard,
  Search,
  Settings2,
  Check,
  ListChecks,
  MessageSquare,
  CheckCircle,
  Reply,
  MoreHorizontal,
  Palette,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { StarButton } from "@/components/ui/star-button";

// Status filter type
type StatusFilter = "all" | "draft" | "published" | "scheduled";

// Keyboard shortcuts data
const KEYBOARD_SHORTCUTS = [
  { keys: ["Ctrl", "B"], action: "Bold" },
  { keys: ["Ctrl", "I"], action: "Italic" },
  { keys: ["Ctrl", "U"], action: "Underline" },
  { keys: ["Ctrl", "K"], action: "Insert link" },
  { keys: ["Ctrl", "Z"], action: "Undo" },
  { keys: ["Ctrl", "Shift", "Z"], action: "Redo" },
  { keys: ["Tab"], action: "Accept AI suggestion" },
  { keys: ["Esc"], action: "Dismiss AI suggestion" },
  { keys: ["Ctrl", "S"], action: "Force save" },
];

// Category colors
const CATEGORY_COLORS = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
];

export default function BlogEditorPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  
  // State
  const [selectedPostId, setSelectedPostId] = useState<Id<"blogPosts"> | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverImageAlt, setCoverImageAlt] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  
  // UI state
  const [showSidebar, setShowSidebar] = useState(false);
  const [showPostList, setShowPostList] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [showCoverImageModal, setShowCoverImageModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  
  // Cover image modal state
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [coverImagePrompt, setCoverImagePrompt] = useState("");
  
  // Category modal state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0].value);
  
  // Outline generator modal state
  const [showOutlineModal, setShowOutlineModal] = useState(false);
  const [outlineTopic, setOutlineTopic] = useState("");
  const [generatedOutline, setGeneratedOutline] = useState<string[]>([]);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  
  // Comments panel state
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for desktop on mount
  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;
    setShowSidebar(isDesktop);
    setShowPostList(isDesktop);
  }, []);

  // Convex queries and mutations
  const posts = useQuery(api.blogPosts.list, 
    statusFilter === "all" ? {} : { status: statusFilter }
  );
  const selectedPost = useQuery(
    api.blogPosts.get,
    selectedPostId ? { id: selectedPostId } : "skip"
  );
  const userProfile = useQuery(
    api.userProfiles.get,
    user?.id ? {} : "skip"
  );
  const categories = useQuery(api.blogPosts.getCategories);
  const versionHistory = useQuery(
    api.blogPosts.getVersionHistory,
    selectedPostId ? { postId: selectedPostId } : "skip"
  );
  const writingGoals = useQuery(api.blogPosts.getWritingGoals);
  
  const collabComments = useQuery(
    api.blogPosts.getCollabComments,
    selectedPostId ? { postId: selectedPostId } : "skip"
  );
  const commentCount = useQuery(
    api.blogPosts.getCollabCommentCount,
    selectedPostId ? { postId: selectedPostId } : "skip"
  );
  
  // Business context for AI features
  const businessContext = useQuery(
    api.businessContext.get,
    user?.id ? {} : "skip"
  );
  
  const createPost = useMutation(api.blogPosts.create);
  const updatePost = useMutation(api.blogPosts.update);
  const deletePost = useMutation(api.blogPosts.remove);
  const saveVersion = useMutation(api.blogPosts.saveVersion);
  const restoreVersion = useMutation(api.blogPosts.restoreVersion);
  const createCategory = useMutation(api.blogPosts.createCategory);
  const addCollabComment = useMutation(api.blogPosts.addCollabComment);
  const updateCollabComment = useMutation(api.blogPosts.updateCollabComment);
  const deleteCollabComment = useMutation(api.blogPosts.deleteCollabComment);
  const toggleResolveComment = useMutation(api.blogPosts.toggleResolveComment);
  
  const isVerified = userProfile?.isVerified ?? false;

  // Filter posts by search query
  const filteredPosts = posts?.filter(post => {
    if (!searchQuery) return true;
    return post.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Load selected post data
  useEffect(() => {
    if (selectedPost) {
      setTitle(selectedPost.title);
      setContent(selectedPost.content);
      setMetaDescription(selectedPost.metaDescription || "");
      setTargetKeyword(selectedPost.targetKeyword || "");
      setCoverImage(selectedPost.coverImage || "");
      setCoverImageAlt(selectedPost.coverImageAlt || "");
      setExcerpt(selectedPost.excerpt || "");
      setCategory(selectedPost.category || "");
      setTags(selectedPost.tags || []);
      if (selectedPost.scheduledAt) {
        setScheduledDate(new Date(selectedPost.scheduledAt));
      } else {
        setScheduledDate(null);
      }
    }
  }, [selectedPost]);

  // Calculate word count and reading time
  const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);

  // Auto-save function
  const autoSave = useCallback(async () => {
    if (!selectedPostId || !title) return;

    setIsSaving(true);
    try {
      await updatePost({
        id: selectedPostId,
        title,
        content,
        excerpt: excerpt || undefined,
        coverImage: coverImage || undefined,
        coverImageAlt: coverImageAlt || undefined,
        metaDescription: metaDescription || undefined,
        targetKeyword: targetKeyword || undefined,
        category: category || undefined,
        tags: tags.length > 0 ? tags : undefined,
        wordCount,
        readingTimeMinutes: readingTime,
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  }, [selectedPostId, title, content, excerpt, coverImage, coverImageAlt, metaDescription, targetKeyword, category, tags, wordCount, readingTime, updatePost]);

  // Debounced auto-save on content change
  useEffect(() => {
    if (!selectedPostId) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content, excerpt, coverImage, metaDescription, targetKeyword, category, tags, selectedPostId, autoSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        autoSave();
      }
      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [autoSave]);

  // Create new post
  const handleNewPost = async () => {
    try {
      const id = await createPost({
        title: "Untitled Post",
        content: "",
      });
      setSelectedPostId(id);
      setTitle("Untitled Post");
      setContent("");
      setMetaDescription("");
      setTargetKeyword("");
      setCoverImage("");
      setCoverImageAlt("");
      setExcerpt("");
      setCategory("");
      setTags([]);
      setScheduledDate(null);
      if (window.innerWidth < 1024) {
        setShowPostList(false);
      }
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  // Delete post
  const handleDeletePost = async (id: Id<"blogPosts">) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await deletePost({ id });
      if (selectedPostId === id) {
        setSelectedPostId(null);
        setTitle("");
        setContent("");
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  // Select post
  const handleSelectPost = (id: Id<"blogPosts">) => {
    // Save current version before switching
    if (selectedPostId && content) {
      saveVersion({ postId: selectedPostId });
    }
    setSelectedPostId(id);
    if (window.innerWidth < 1024) {
      setShowPostList(false);
    }
  };

  // Publish post
  const handlePublish = async () => {
    if (!selectedPostId || !isVerified) return;
    
    setIsPublishing(true);
    setPublishError(null);
    
    try {
      await saveVersion({ postId: selectedPostId, changeNote: "Published" });
      await updatePost({
        id: selectedPostId,
        status: "published",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to publish";
      setPublishError(message);
    } finally {
      setIsPublishing(false);
    }
  };

  // Schedule post
  const handleSchedule = async () => {
    if (!selectedPostId || !isVerified || !scheduledDate) return;
    
    setIsPublishing(true);
    setPublishError(null);
    
    try {
      await updatePost({
        id: selectedPostId,
        status: "scheduled",
        scheduledAt: scheduledDate.getTime(),
      });
      setShowScheduleModal(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to schedule";
      setPublishError(message);
    } finally {
      setIsPublishing(false);
    }
  };

  // Unpublish post
  const handleUnpublish = async () => {
    if (!selectedPostId) return;
    
    setIsSaving(true);
    try {
      await updatePost({
        id: selectedPostId,
        status: "draft",
      });
    } catch (error) {
      console.error("Failed to unpublish:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Restore version
  const handleRestoreVersion = async (versionNumber: number) => {
    if (!selectedPostId) return;
    
    try {
      await restoreVersion({ postId: selectedPostId, versionNumber });
      setShowVersionHistory(false);
    } catch (error) {
      console.error("Failed to restore version:", error);
    }
  };

  // Add tag
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Remove tag
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Create category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      await createCategory({
        name: newCategoryName.trim(),
        color: newCategoryColor,
      });
      setNewCategoryName("");
      setShowCategoryModal(false);
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  };

  // Generate cover image with AI
  const handleGenerateCoverImage = async () => {
    if (!coverImagePrompt) return;
    
    setIsGeneratingCover(true);
    try {
      const response = await fetch("/api/ai/menu-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Blog cover image: ${coverImagePrompt}. Professional, modern, high quality.`,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          setCoverImage(data.imageUrl);
          setCoverImageUrl(data.imageUrl);
        }
      }
    } catch (error) {
      console.error("Failed to generate cover image:", error);
    } finally {
      setIsGeneratingCover(false);
    }
  };

  // Apply cover image from URL
  const handleApplyCoverImage = () => {
    if (coverImageUrl) {
      setCoverImage(coverImageUrl);
      setShowCoverImageModal(false);
    }
  };

  // Generate meta description with AI
  const handleGenerateMetaDescription = async () => {
    if (!content) return;

    const plainText = content.replace(/<[^>]*>/g, "").slice(0, 1000);
    
    try {
      const response = await fetch("/api/ai/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: "summarize",
          text: plainText,
          customPrompt: "Write a compelling meta description for this blog post. It should be 150-160 characters, include the main topic, and encourage clicks. Only return the meta description, nothing else.",
        }),
      });

      if (!response.ok) return;

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullText += parsed.content;
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }

      if (fullText) {
        setMetaDescription(fullText.slice(0, 160));
      }
    } catch (error) {
      console.error("Failed to generate meta description:", error);
    }
  };

  // Generate blog outline with AI
  const handleGenerateOutline = async () => {
    const topic = outlineTopic || title;
    if (!topic) return;
    
    setIsGeneratingOutline(true);
    setGeneratedOutline([]);
    
    try {
      const response = await fetch("/api/ai/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: "custom",
          text: topic,
          customPrompt: `Generate a detailed blog post outline for the topic: "${topic}". 
Create a well-structured outline with:
- An engaging introduction hook
- 4-6 main sections with descriptive headings
- 2-3 sub-points under each main section
- A conclusion section

Format each item on a new line. Use "##" for main headings and "-" for sub-points.
Example format:
## Introduction
- Hook to grab reader attention
- Brief overview of what the post covers

## Main Section 1
- Sub-point explaining the first concept
- Supporting details or examples

Only return the outline, no other text.`,
        }),
      });

      if (!response.ok) return;

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullText += parsed.content;
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }

      if (fullText) {
        // Parse the outline into array items
        const outlineItems = fullText
          .split("\n")
          .map(line => line.trim())
          .filter(line => line.length > 0);
        setGeneratedOutline(outlineItems);
      }
    } catch (error) {
      console.error("Failed to generate outline:", error);
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  // Apply outline to editor
  const handleApplyOutline = () => {
    if (generatedOutline.length === 0) return;
    
    // Convert outline to HTML
    let html = "";
    for (const item of generatedOutline) {
      if (item.startsWith("## ")) {
        html += `<h2>${item.slice(3)}</h2>\n`;
      } else if (item.startsWith("### ")) {
        html += `<h3>${item.slice(4)}</h3>\n`;
      } else if (item.startsWith("- ")) {
        html += `<p>${item.slice(2)}</p>\n`;
      } else {
        html += `<p>${item}</p>\n`;
      }
    }
    
    setContent(html);
    setShowOutlineModal(false);
    setGeneratedOutline([]);
    setOutlineTopic("");
  };

  // Add a collaboration comment
  const handleAddComment = async (parentId?: string) => {
    if (!selectedPostId || !newComment.trim()) return;
    
    try {
      await addCollabComment({
        postId: selectedPostId,
        content: newComment.trim(),
        parentId: parentId as Id<"blogPostCollabComments"> | undefined,
      });
      setNewComment("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  // Update a comment
  const handleUpdateComment = async (commentId: string) => {
    if (!editCommentContent.trim()) return;
    
    try {
      await updateCollabComment({
        commentId: commentId as Id<"blogPostCollabComments">,
        content: editCommentContent.trim(),
      });
      setEditingComment(null);
      setEditCommentContent("");
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    
    try {
      await deleteCollabComment({
        commentId: commentId as Id<"blogPostCollabComments">,
      });
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  // Toggle resolve status
  const handleToggleResolve = async (commentId: string) => {
    try {
      await toggleResolveComment({
        commentId: commentId as Id<"blogPostCollabComments">,
      });
    } catch (error) {
      console.error("Failed to toggle resolve:", error);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded flex items-center gap-1">
            <Check className="h-3 w-3" />
            <span className="hidden sm:inline">Published</span>
          </span>
        );
      case "scheduled":
        return (
          <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span className="hidden sm:inline">Scheduled</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">
            Draft
          </span>
        );
    }
  };

  // Loading state
  if (!isLoaded) {
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
        <FileText className="h-12 sm:h-16 w-12 sm:w-16 text-rose-500 mb-4" />
        <h1 className="text-xl sm:text-2xl font-bold mb-2 text-center">Blog Editor</h1>
        <p className="text-neutral-400 mb-6 text-center">Sign in to start writing</p>
        <Link
          href="/login"
          className="px-6 py-2 bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] bg-black text-white overflow-hidden pb-safe">
      {/* Mobile overlay for post list */}
      {showPostList && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowPostList(false)}
        />
      )}

      {/* Posts sidebar */}
      <div
        className={cn(
          "flex flex-col border-r border-neutral-800 bg-neutral-950 transition-all duration-300 z-30",
          "fixed lg:relative inset-y-0 left-0",
          showPostList ? "w-72 sm:w-80" : "w-0 overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-neutral-400 hover:text-white">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h2 className="font-semibold">Posts</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleNewPost}
              className="p-1.5 bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors"
              title="New Post"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowPostList(false)}
              className="lg:hidden p-1.5 text-neutral-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="p-2 space-y-2 border-b border-neutral-800">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
            />
          </div>
          <div className="flex gap-1">
            {(["all", "draft", "published", "scheduled"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "flex-1 px-2 py-1 text-xs rounded-lg transition-colors capitalize",
                  statusFilter === status
                    ? "bg-rose-500 text-white"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Writing streak banner */}
        {writingGoals && writingGoals.currentStreak > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-neutral-800">
            <Flame className="h-4 w-4 text-orange-400" />
            <span className="text-xs text-orange-300">
              {writingGoals.currentStreak} day streak!
            </span>
            <span className="ml-auto text-xs text-neutral-500">
              {writingGoals.totalWordsWritten.toLocaleString()} total words
            </span>
          </div>
        )}

        {/* Posts list */}
        <div className="flex-1 overflow-y-auto">
          {filteredPosts?.length === 0 && (
            <div className="p-4 text-center text-neutral-500">
              <p className="text-sm">No posts found</p>
              <button
                onClick={handleNewPost}
                className="mt-2 text-rose-400 hover:text-rose-300 text-sm"
              >
                Create your first post
              </button>
            </div>
          )}

          {filteredPosts?.map((post) => (
            <div
              key={post._id}
              className={cn(
                "group flex items-start gap-3 p-3 border-b border-neutral-800/50 cursor-pointer transition-colors",
                selectedPostId === post._id
                  ? "bg-neutral-800/50"
                  : "hover:bg-neutral-900"
              )}
              onClick={() => handleSelectPost(post._id)}
            >
              {/* Cover image thumbnail */}
              {post.coverImage ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-800">
                  <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-neutral-600" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate flex-1">{post.title}</p>
                  {getStatusBadge(post.status)}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {post.category && (
                    <span className="text-xs px-1.5 py-0.5 bg-neutral-800 text-neutral-400 rounded">
                      {post.category}
                    </span>
                  )}
                  <p className="text-xs text-neutral-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(post.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePost(post._id);
                }}
                className="p-1 text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-2 sm:px-4 py-2 border-b border-neutral-800">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setShowPostList(!showPostList)}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              title="Show posts"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {lastSaved && (
              <span className="text-xs text-neutral-500 flex items-center gap-1">
                {isSaving ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="hidden sm:inline">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3" />
                    <span className="hidden sm:inline">Saved {lastSaved.toLocaleTimeString()}</span>
                  </>
                )}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {selectedPost && getStatusBadge(selectedPost.status)}
            
            {/* Cover image button */}
            {selectedPostId && (
              <button
                onClick={() => setShowCoverImageModal(true)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  coverImage
                    ? "text-green-400 bg-green-500/10"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                )}
                title="Cover image"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
            )}

            {/* Version history */}
            {selectedPostId && (
              <button
                onClick={() => setShowVersionHistory(true)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                title="Version history"
              >
                <History className="h-4 w-4" />
              </button>
            )}

            {/* Preview */}
            {selectedPostId && (
              <button
                onClick={() => setShowPreview(true)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                title="Preview"
              >
                <Eye className="h-4 w-4" />
              </button>
            )}
            
            {/* Comments */}
            {selectedPostId && (
              <button
                onClick={() => setShowCommentsPanel(true)}
                className={cn(
                  "p-2 rounded-lg transition-colors relative",
                  commentCount && commentCount.unresolved > 0
                    ? "text-amber-400 bg-amber-500/10"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                )}
                title="Comments"
              >
                <MessageSquare className="h-4 w-4" />
                {commentCount && commentCount.total > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                    {commentCount.total}
                  </span>
                )}
              </button>
            )}
            
            {/* Publish/Schedule/Unpublish buttons */}
            {selectedPostId && selectedPost?.status === "draft" && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePublish}
                  disabled={!isVerified || isPublishing}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                    isVerified
                      ? "bg-rose-500 hover:bg-rose-600 text-white"
                      : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  )}
                  title={isVerified ? "Publish now" : "Only verified accounts can publish"}
                >
                  {isPublishing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">Publish</span>
                </button>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  disabled={!isVerified}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    isVerified
                      ? "text-neutral-400 hover:text-white hover:bg-neutral-800"
                      : "text-neutral-600 cursor-not-allowed"
                  )}
                  title="Schedule"
                >
                  <Calendar className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {selectedPostId && (selectedPost?.status === "published" || selectedPost?.status === "scheduled") && (
              <button
                onClick={handleUnpublish}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors"
              >
                {selectedPost?.status === "scheduled" ? "Cancel" : "Unpublish"}
              </button>
            )}
            
            {/* Settings dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <Settings2 className="h-4 w-4" />
              </button>
              
              {showSettingsDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSettingsDropdown(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-50">
                    <button
                      onClick={() => { setShowOutlineModal(true); setShowSettingsDropdown(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 transition-colors rounded-t-lg"
                    >
                      <ListChecks className="h-4 w-4 text-rose-400" />
                      AI Outline Generator
                    </button>
                    <button
                      onClick={() => { setShowKeyboardShortcuts(true); setShowSettingsDropdown(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 transition-colors"
                    >
                      <Keyboard className="h-4 w-4" />
                      Keyboard Shortcuts
                    </button>
                    <button
                      onClick={() => { setShowCategoryModal(true); setShowSettingsDropdown(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 transition-colors rounded-b-lg"
                    >
                      <FolderOpen className="h-4 w-4" />
                      Manage Categories
                    </button>
                  </div>
                </>
              )}
            </div>
            
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              title={showSidebar ? "Hide SEO sidebar" : "Show SEO sidebar"}
            >
              {showSidebar ? <PanelRightClose className="h-5 w-5" /> : <PanelRight className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        {/* Verification banner for unverified users */}
        {!isVerified && selectedPostId && (
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-500/10 border-b border-amber-500/20">
            <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-200 flex-1">
              <span className="hidden sm:inline">Only verified accounts can publish posts. </span>
              <Link href="/verify" className="text-amber-400 hover:text-amber-300 underline">Get verified</Link>
            </p>
            <Link href="/verify" className="flex items-center gap-1 px-2 py-1 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded transition-colors">
              <Cherry className="h-3 w-3" />
              <span className="hidden sm:inline">Apply</span>
            </Link>
          </div>
        )}
        
        {/* Business context banner for AI personalization */}
        {businessContext !== undefined && (!businessContext || (businessContext.completionPercentage ?? 0) < 50) && (
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-rose-500/10 border-b border-rose-500/20">
            <Palette className="h-4 w-4 text-rose-400 flex-shrink-0" />
            <p className="text-xs text-rose-200 flex-1">
              <span className="hidden sm:inline">Set up your brand context for personalized AI content. </span>
              <span className="sm:hidden">Personalize AI content. </span>
            </p>
            <Link 
              href="/dashboard/brand" 
              className="flex items-center gap-1 px-2 py-1 text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded transition-colors"
            >
              <span>Set up</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
        
        {/* Publish error banner */}
        {publishError && (
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-500/10 border-b border-red-500/20">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-200 flex-1">{publishError}</p>
            <button onClick={() => setPublishError(null)} className="text-red-400 hover:text-red-300">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Tags and category bar */}
        {selectedPostId && (
          <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-800 overflow-x-auto">
            {/* Category */}
            <div className="flex items-center gap-1 shrink-0">
              <FolderOpen className="h-3.5 w-3.5 text-neutral-500" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-rose-500"
              >
                <option value="">No category</option>
                {categories?.map((cat) => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div className="w-px h-4 bg-neutral-700 shrink-0" />
            
            {/* Tags */}
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <Tag className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
              <div className="flex items-center gap-1 flex-wrap">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-0.5 text-xs bg-neutral-800 text-neutral-300 rounded">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="text-neutral-500 hover:text-red-400">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                  placeholder="Add tag..."
                  className="w-20 px-1 py-0.5 text-xs bg-transparent text-white placeholder:text-neutral-600 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="w-px h-4 bg-neutral-700 shrink-0" />
            
            {/* Word count */}
            <div className="flex items-center gap-2 text-xs text-neutral-500 shrink-0">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{readingTime} min read</span>
            </div>
          </div>
        )}

        {/* Editor content */}
        <div className="flex-1 flex overflow-hidden relative pb-16 lg:pb-0">
          {selectedPostId ? (
            <>
              {/* Editor */}
              <div className="flex-1 min-w-0 flex flex-col">
                {/* Cover image preview */}
                {coverImage && (
                  <div className="relative h-48 border-b border-neutral-800 group">
                    <img src={coverImage} alt={coverImageAlt || "Cover"} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button onClick={() => setShowCoverImageModal(true)} className="px-3 py-1.5 bg-white/20 text-white text-sm rounded-lg hover:bg-white/30 transition-colors">
                        Change
                      </button>
                      <button onClick={() => setCoverImage("")} className="px-3 py-1.5 bg-red-500/20 text-red-300 text-sm rounded-lg hover:bg-red-500/30 transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex-1 overflow-hidden">
                  <BlogEditor
                    key={selectedPostId}
                    initialTitle={title}
                    initialContent={content}
                    onTitleChange={setTitle}
                    onContentChange={setContent}
                    className="h-full"
                  />
                </div>
              </div>

              {/* Mobile overlay for SEO sidebar */}
              {showSidebar && (
                <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setShowSidebar(false)} />
              )}

              {/* SEO Sidebar */}
              <div className={cn(
                "border-l border-neutral-800 bg-neutral-950 transition-all duration-300 overflow-y-auto z-20",
                "fixed lg:relative inset-y-0 right-0",
                showSidebar ? "w-72 sm:w-80" : "w-0 overflow-hidden"
              )}>
                <div className="lg:hidden flex items-center justify-between p-3 border-b border-neutral-800">
                  <h3 className="font-semibold text-sm">SEO & Settings</h3>
                  <button onClick={() => setShowSidebar(false)} className="p-1 text-neutral-400 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Excerpt input */}
                <div className="p-3 border-b border-neutral-800">
                  <label className="text-xs font-medium text-neutral-400 mb-1.5 block">Excerpt</label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Short summary of your post..."
                    className="w-full h-20 px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 resize-none focus:outline-none focus:border-rose-500"
                  />
                </div>
                
                <SEOSidebar
                  title={title}
                  content={content}
                  metaDescription={metaDescription}
                  targetKeyword={targetKeyword}
                  onMetaDescriptionChange={setMetaDescription}
                  onTargetKeywordChange={setTargetKeyword}
                  onGenerateMetaDescription={handleGenerateMetaDescription}
                  className="m-3"
                />
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 p-4">
              <FileText className="h-12 sm:h-16 w-12 sm:w-16 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 text-center">No post selected</h3>
              <p className="text-sm mb-4 text-center">Select a post or create a new one</p>
              <button onClick={handleNewPost} className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors">
                <Plus className="h-4 w-4" />
                New Post
              </button>
            </div>
          )}
        </div>

        {/* Mobile Bottom Action Bar */}
        {selectedPostId && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-800 px-4 py-3 pb-safe flex items-center justify-around gap-2 z-30">
            <button
              onClick={() => setShowPostList(true)}
              className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white transition-colors"
            >
              <FileText className="h-5 w-5" />
              <span className="text-[10px]">Posts</span>
            </button>

            <button
              onClick={() => setShowPreview(true)}
              className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white transition-colors"
            >
              <Eye className="h-5 w-5" />
              <span className="text-[10px]">Preview</span>
            </button>

            <button
              onClick={() => setShowSidebar(true)}
              className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white transition-colors"
            >
              <Settings2 className="h-5 w-5" />
              <span className="text-[10px]">SEO</span>
            </button>

            {selectedPost?.status === "draft" && isVerified ? (
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex flex-col items-center gap-1 text-rose-400 hover:text-rose-300 transition-colors"
              >
                {isPublishing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                <span className="text-[10px]">Publish</span>
              </button>
            ) : selectedPost?.status === "published" ? (
              <button
                onClick={handleUnpublish}
                className="flex flex-col items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
              >
                <Check className="h-5 w-5" />
                <span className="text-[10px]">Live</span>
              </button>
            ) : (
              <button
                onClick={() => setShowCoverImageModal(true)}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  coverImage ? "text-green-400" : "text-neutral-400 hover:text-white"
                )}
              >
                <ImageIcon className="h-5 w-5" />
                <span className="text-[10px]">Cover</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cover Image Modal */}
      {showCoverImageModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-rose-500" />
                Cover Image
              </h2>
              <button onClick={() => setShowCoverImageModal(false)} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {(coverImage || coverImageUrl) && (
                <div className="aspect-video rounded-lg overflow-hidden bg-neutral-800">
                  <img src={coverImage || coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                  />
                  <button onClick={handleApplyCoverImage} disabled={!coverImageUrl} className="px-3 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-neutral-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Apply
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-800" /></div>
                <div className="relative flex justify-center text-xs"><span className="px-2 bg-neutral-900 text-neutral-500">or generate with AI</span></div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Describe your cover image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coverImagePrompt}
                    onChange={(e) => setCoverImagePrompt(e.target.value)}
                    placeholder="A modern tech workspace with plants..."
                    className="flex-1 px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                  />
                  <StarButton onClick={handleGenerateCoverImage} disabled={!coverImagePrompt || isGeneratingCover} className="h-9 px-4">
                    {isGeneratingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Generate
                  </StarButton>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Alt text (for accessibility)</label>
                <input
                  type="text"
                  value={coverImageAlt}
                  onChange={(e) => setCoverImageAlt(e.target.value)}
                  placeholder="Describe the image..."
                  className="w-full px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 p-4 border-t border-neutral-800">
              <button onClick={() => setShowCoverImageModal(false)} className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium transition-colors">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Schedule Post
              </h2>
              <button onClick={() => setShowScheduleModal(false)} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Publish Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduledDate ? scheduledDate.toISOString().slice(0, 16) : ""}
                  onChange={(e) => setScheduledDate(e.target.value ? new Date(e.target.value) : null)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              
              {scheduledDate && (
                <p className="text-sm text-neutral-400">
                  Your post will be published on{" "}
                  <span className="text-white font-medium">
                    {scheduledDate.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </p>
              )}
            </div>
            
            <div className="flex justify-end gap-2 p-4 border-t border-neutral-800">
              <button onClick={() => setShowScheduleModal(false)} className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleSchedule} disabled={!scheduledDate || isPublishing} className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-neutral-700 text-white text-sm font-medium rounded-lg transition-colors">
                {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionHistory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <History className="h-5 w-5 text-purple-500" />
                Version History
              </h2>
              <button onClick={() => setShowVersionHistory(false)} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {versionHistory?.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No version history yet</p>
                  <p className="text-sm mt-1">Versions are saved when you switch between posts</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {versionHistory?.map((version) => (
                    <div key={version._id} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-white">Version {version.versionNumber}</p>
                        <p className="text-xs text-neutral-500">{new Date(version.createdAt).toLocaleString()}</p>
                        {version.changeNote && <p className="text-xs text-neutral-400 mt-1">{version.changeNote}</p>}
                      </div>
                      <button onClick={() => handleRestoreVersion(version.versionNumber)} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg transition-colors">
                        <RotateCcw className="h-3 w-3" />
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-green-500" />
                Manage Categories
              </h2>
              <button onClick={() => setShowCategoryModal(false)} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                {categories?.map((cat) => (
                  <div key={cat._id} className="flex items-center justify-between p-2 bg-neutral-800/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || "#666" }} />
                      <span className="text-sm text-white">{cat.name}</span>
                    </div>
                    <span className="text-xs text-neutral-500">{cat.postCount} posts</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-neutral-800">
                <label className="text-sm font-medium text-neutral-300 mb-2 block">Add new category</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name"
                    className="flex-1 px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-green-500"
                  />
                  <select
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                    style={{ backgroundColor: newCategoryColor }}
                  >
                    {CATEGORY_COLORS.map((color) => (
                      <option key={color.value} value={color.value}>{color.name}</option>
                    ))}
                  </select>
                  <button onClick={handleCreateCategory} disabled={!newCategoryName.trim()} className="px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-neutral-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Add
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end p-4 border-t border-neutral-800">
              <button onClick={() => setShowCategoryModal(false)} className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium transition-colors">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedPost && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white sm:rounded-2xl w-full sm:max-w-3xl min-h-screen sm:min-h-0 sm:my-8">
            <div className="sticky top-0 flex items-center justify-between p-4 bg-white border-b rounded-t-2xl">
              <h2 className="text-lg font-semibold text-neutral-900">Preview</h2>
              <button onClick={() => setShowPreview(false)} className="text-neutral-500 hover:text-neutral-900">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <article className="prose prose-neutral max-w-none p-8">
              {coverImage && <img src={coverImage} alt={coverImageAlt || title} className="w-full aspect-video object-cover rounded-xl mb-8" />}
              <h1 className="text-4xl font-bold text-neutral-900 mb-4">{title}</h1>
              {excerpt && <p className="text-lg text-neutral-600 mb-6 italic">{excerpt}</p>}
              <div className="flex items-center gap-4 text-sm text-neutral-500 mb-8">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{readingTime} min read</span>
                {category && <><span>•</span><span>{category}</span></>}
              </div>
              <div className="text-neutral-700" dangerouslySetInnerHTML={{ __html: content }} />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t">
                  {tags.map((tag) => <span key={tag} className="px-3 py-1 bg-neutral-100 text-neutral-600 text-sm rounded-full">#{tag}</span>)}
                </div>
              )}
            </article>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-yellow-500" />
                Keyboard Shortcuts
              </h2>
              <button onClick={() => setShowKeyboardShortcuts(false)} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-2">
              {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-neutral-800/50 rounded-lg">
                  <span className="text-sm text-neutral-300">{shortcut.action}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, i) => (
                      <span key={i}>
                        <kbd className="px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-300">{key}</kbd>
                        {i < shortcut.keys.length - 1 && <span className="text-neutral-600 mx-1">+</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-neutral-800 text-center">
              <p className="text-xs text-neutral-500">
                Press <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-400">?</kbd> anytime to open this panel
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Outline Generator Modal */}
      {showOutlineModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-rose-500" />
                AI Outline Generator
              </h2>
              <button onClick={() => { setShowOutlineModal(false); setGeneratedOutline([]); setOutlineTopic(""); }} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              {/* Topic input */}
              <div>
                <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Blog Topic or Title</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={outlineTopic}
                    onChange={(e) => setOutlineTopic(e.target.value)}
                    placeholder={title || "Enter your blog topic..."}
                    className="flex-1 px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                    onKeyDown={(e) => e.key === "Enter" && handleGenerateOutline()}
                  />
                  <StarButton
                    onClick={handleGenerateOutline}
                    disabled={isGeneratingOutline || (!outlineTopic && !title)}
                    className="h-9 px-4"
                  >
                    {isGeneratingOutline ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Generate
                  </StarButton>
                </div>
                <p className="text-xs text-neutral-500 mt-1.5">
                  {title ? `Using title: "${title}" if no topic entered` : "Enter a topic to generate an outline"}
                </p>
              </div>
              
              {/* Generated outline */}
              {generatedOutline.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-2 block">Generated Outline</label>
                  <div className="bg-neutral-800/50 rounded-lg p-4 space-y-1 max-h-64 overflow-y-auto">
                    {generatedOutline.map((item, index) => {
                      const isHeading = item.startsWith("## ") || item.startsWith("### ");
                      const isSubPoint = item.startsWith("- ");
                      
                      return (
                        <div
                          key={index}
                          className={cn(
                            "text-sm",
                            isHeading && "font-semibold text-white mt-3 first:mt-0",
                            isSubPoint && "text-neutral-400 ml-4",
                            !isHeading && !isSubPoint && "text-neutral-300"
                          )}
                        >
                          {isHeading ? item.replace(/^##+ /, "") : isSubPoint ? `• ${item.slice(2)}` : item}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Empty state */}
              {generatedOutline.length === 0 && !isGeneratingOutline && (
                <div className="text-center py-8 text-neutral-500">
                  <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Enter a topic and click Generate</p>
                  <p className="text-sm mt-1">AI will create a structured outline for your blog post</p>
                </div>
              )}
              
              {/* Loading state */}
              {isGeneratingOutline && (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-rose-500" />
                  <p className="text-neutral-400">Generating your outline...</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 p-4 border-t border-neutral-800">
              <button
                onClick={() => { setShowOutlineModal(false); setGeneratedOutline([]); setOutlineTopic(""); }}
                className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyOutline}
                disabled={generatedOutline.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-neutral-700 disabled:text-neutral-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <ListChecks className="h-4 w-4" />
                Use This Outline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Panel Modal */}
      {showCommentsPanel && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-amber-500" />
                  Comments & Feedback
                </h2>
                {commentCount && (
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {commentCount.total} comments • {commentCount.unresolved} unresolved
                  </p>
                )}
              </div>
              <button onClick={() => setShowCommentsPanel(false)} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Comment list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {collabComments?.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No comments yet</p>
                  <p className="text-sm mt-1">Add feedback or suggestions for this post</p>
                </div>
              ) : (
                collabComments?.flatMap((comment) => {
                  if (comment.parentId) return [];
                  const replies = collabComments?.filter(c => c.parentId === comment._id) || [];
                  const isOwner = comment.authorId === user?.id;
                  const isPostOwner = selectedPost?.authorId === user?.id;
                  
                  return [
                    <div key={comment._id} className={cn(
                      "rounded-lg border transition-colors",
                      comment.isResolved
                        ? "bg-green-500/5 border-green-500/20"
                        : "bg-neutral-800/50 border-neutral-700/50"
                    )}>
                      {/* Main comment */}
                      <div className="p-3">
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center shrink-0 overflow-hidden">
                            {comment.authorImage ? (
                              <img src={comment.authorImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-medium text-neutral-400">
                                {comment.authorName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-white">{comment.authorName}</span>
                              <span className="text-xs text-neutral-500">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                              {comment.isEdited && (
                                <span className="text-xs text-neutral-600">(edited)</span>
                              )}
                              {comment.isResolved && (
                                <span className="flex items-center gap-1 text-xs text-green-400">
                                  <CheckCircle className="h-3 w-3" />
                                  Resolved
                                </span>
                              )}
                            </div>
                            
                            {/* Selected text reference */}
                            {comment.selectedText && (
                              <div className="mt-1 px-2 py-1 bg-amber-500/10 border-l-2 border-amber-500 text-xs text-amber-200/70 italic rounded">
                                "{comment.selectedText}"
                              </div>
                            )}
                            
                            {/* Comment content */}
                            {editingComment === comment._id ? (
                              <div className="mt-2 space-y-2">
                                <textarea
                                  value={editCommentContent}
                                  onChange={(e) => setEditCommentContent(e.target.value)}
                                  className="w-full px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 resize-none focus:outline-none focus:border-rose-500"
                                  rows={2}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdateComment(comment._id)}
                                    className="px-3 py-1 text-xs bg-rose-500 hover:bg-rose-600 text-white rounded transition-colors"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => { setEditingComment(null); setEditCommentContent(""); }}
                                    className="px-3 py-1 text-xs text-neutral-400 hover:text-white transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="mt-1 text-sm text-neutral-300">{comment.content}</p>
                            )}
                            
                            {/* Actions */}
                            {editingComment !== comment._id && (
                              <div className="flex items-center gap-3 mt-2">
                                <button
                                  onClick={() => setReplyingTo(comment._id)}
                                  className="flex items-center gap-1 text-xs text-neutral-500 hover:text-white transition-colors"
                                >
                                  <Reply className="h-3 w-3" />
                                  Reply
                                </button>
                                {isPostOwner && (
                                  <button
                                    onClick={() => handleToggleResolve(comment._id)}
                                    className={cn(
                                      "flex items-center gap-1 text-xs transition-colors",
                                      comment.isResolved
                                        ? "text-green-400 hover:text-green-300"
                                        : "text-neutral-500 hover:text-green-400"
                                    )}
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                    {comment.isResolved ? "Unresolve" : "Resolve"}
                                  </button>
                                )}
                                {isOwner && (
                                  <>
                                    <button
                                      onClick={() => { setEditingComment(comment._id); setEditCommentContent(comment.content); }}
                                      className="text-xs text-neutral-500 hover:text-white transition-colors"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(comment._id)}
                                      className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Replies */}
                      {replies.length > 0 && (
                        <div className="border-t border-neutral-700/50 bg-neutral-800/30">
                          {replies.map((reply) => {
                            const isReplyOwner = reply.authorId === user?.id;
                            
                            return (
                              <div key={reply._id} className="p-3 pl-12 border-b border-neutral-700/30 last:border-b-0">
                                <div className="flex items-start gap-2">
                                  <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center shrink-0 overflow-hidden">
                                    {reply.authorImage ? (
                                      <img src={reply.authorImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-[10px] font-medium text-neutral-400">
                                        {reply.authorName.charAt(0).toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-white">{reply.authorName}</span>
                                      <span className="text-[10px] text-neutral-500">
                                        {new Date(reply.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="mt-0.5 text-xs text-neutral-400">{reply.content}</p>
                                    {isReplyOwner && (
                                      <button
                                        onClick={() => handleDeleteComment(reply._id)}
                                        className="text-[10px] text-neutral-600 hover:text-red-400 mt-1 transition-colors"
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Reply input */}
                      {replyingTo === comment._id && (
                        <div className="p-3 border-t border-neutral-700/50 bg-neutral-800/30">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Write a reply..."
                              className="flex-1 px-3 py-1.5 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                              onKeyDown={(e) => e.key === "Enter" && handleAddComment(comment._id)}
                              autoFocus
                            />
                            <button
                              onClick={() => handleAddComment(comment._id)}
                              disabled={!newComment.trim()}
                              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 disabled:bg-neutral-700 text-white text-sm rounded-lg transition-colors"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => { setReplyingTo(null); setNewComment(""); }}
                              className="px-2 py-1.5 text-neutral-500 hover:text-white transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ];
                })
              )}
            </div>
            
            {/* Add new comment */}
            <div className="p-4 border-t border-neutral-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyingTo ? "" : newComment}
                  onChange={(e) => !replyingTo && setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  disabled={!!replyingTo}
                  className="flex-1 px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500 disabled:opacity-50"
                  onKeyDown={(e) => e.key === "Enter" && !replyingTo && handleAddComment()}
                />
                <button
                  onClick={() => handleAddComment()}
                  disabled={!newComment.trim() || !!replyingTo}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-neutral-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Send className="h-4 w-4" />
                  Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
