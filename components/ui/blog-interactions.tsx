"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Heart,
  Bookmark,
  MessageCircle,
  Share2,
  Link2,
  Mail,
  Check,
  Send,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

// Simple SVG icons for social platforms
const TwitterIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

import { Textarea } from "./textarea";

interface BlogInteractionsProps {
  postSlug: string;
  postTitle: string;
}

export function BlogInteractions({ postSlug, postTitle }: BlogInteractionsProps) {
  const { user, isSignedIn } = useUser();
  const [showComments, setShowComments] = useState(false);

  // Queries
  const stats = useQuery(api.blog.getPostStats, { postSlug });
  const hasLiked = useQuery(api.blog.hasLiked, {
    userId: user?.id,
    postSlug,
  });
  const hasBookmarked = useQuery(api.blog.hasBookmarked, {
    userId: user?.id,
    postSlug,
  });

  // Mutations
  const toggleLike = useMutation(api.blog.toggleLike);
  const toggleBookmark = useMutation(api.blog.toggleBookmark);
  const trackShare = useMutation(api.blog.trackShare);

  const handleLike = async () => {
    if (!isSignedIn || !user) return;
    await toggleLike({ postSlug });
  };

  const handleBookmark = async () => {
    if (!isSignedIn || !user) return;
    await toggleBookmark({ postSlug });
  };

  const handleShare = async (platform: string) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `Check out "${postTitle}" on CherryCap`;

    await trackShare({ userId: user?.id, postSlug, platform });

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent(postTitle)}&body=${encodeURIComponent(text + "\n\n" + url)}`;
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Interaction Bar */}
      <div className="flex items-center justify-between py-4 border-y border-border">
        <div className="flex items-center gap-1">
          {/* Like Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={!isSignedIn}
            className={`gap-2 ${hasLiked ? "text-rose-500 hover:text-rose-600" : ""}`}
          >
            <Heart className={`h-5 w-5 ${hasLiked ? "fill-current" : ""}`} />
            <span>{stats?.likesCount || 0}</span>
          </Button>

          {/* Comment Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{stats?.commentsCount || 0}</span>
          </Button>

          {/* Bookmark Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            disabled={!isSignedIn}
            className={`gap-2 ${hasBookmarked ? "text-amber-500 hover:text-amber-600" : ""}`}
          >
            <Bookmark className={`h-5 w-5 ${hasBookmarked ? "fill-current" : ""}`} />
          </Button>
        </div>

        {/* Share Menu */}
        <ShareMenu
          onShare={handleShare}
          sharesCount={stats?.sharesCount || 0}
        />
      </div>

      {/* Comments Section */}
      {showComments && (
        <CommentsSection postSlug={postSlug} />
      )}

      {!isSignedIn && (
        <p className="text-sm text-muted-foreground text-center">
          Sign in to like, comment, and bookmark posts.
        </p>
      )}
    </div>
  );
}

// Share Menu Component
function ShareMenu({
  onShare,
  sharesCount,
}: {
  onShare: (platform: string) => void;
  sharesCount: number;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    await navigator.clipboard.writeText(url);
    setCopied(true);
    onShare("copy_link");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Share2 className="h-5 w-5" />
          <span>{sharesCount > 0 ? sharesCount : "Share"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onShare("twitter")}>
          <span className="mr-2"><TwitterIcon /></span>
          Twitter / X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShare("facebook")}>
          <span className="mr-2"><FacebookIcon /></span>
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShare("linkedin")}>
          <span className="mr-2"><LinkedInIcon /></span>
          LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShare("email")}>
          <Mail className="h-4 w-4 mr-2" />
          Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4 mr-2" />
              Copy Link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Comments Section Component
function CommentsSection({ postSlug }: { postSlug: string }) {
  const { user, isSignedIn } = useUser();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<Id<"blogComments"> | null>(null);
  const [editingId, setEditingId] = useState<Id<"blogComments"> | null>(null);
  const [editContent, setEditContent] = useState("");

  const comments = useQuery(api.blog.getComments, { postSlug });
  const addComment = useMutation(api.blog.addComment);
  const editComment = useMutation(api.blog.editComment);
  const deleteComment = useMutation(api.blog.deleteComment);

  const handleSubmit = async (parentId?: Id<"blogComments">) => {
    if (!isSignedIn || !user || !newComment.trim()) return;

    await addComment({
      userName: user.fullName || user.username || "Anonymous",
      userImage: user.imageUrl,
      postSlug,
      content: newComment.trim(),
      parentId,
    });

    setNewComment("");
    setReplyingTo(null);
  };

  const handleEdit = async (commentId: Id<"blogComments">) => {
    if (!user || !editContent.trim()) return;

    await editComment({
      commentId,
      content: editContent.trim(),
    });

    setEditingId(null);
    setEditContent("");
  };

  const handleDelete = async (commentId: Id<"blogComments">) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this comment?")) return;

    await deleteComment({ commentId });
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">Comments</h3>

      {/* New Comment Form */}
      {isSignedIn ? (
        <div className="flex gap-3">
          <img
            src={user?.imageUrl}
            alt={user?.fullName || "User"}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => handleSubmit()}
                disabled={!newComment.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Post
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">Sign in to leave a comment.</p>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments?.map((comment) => (
          <div key={comment._id} className="space-y-3">
            {/* Main Comment */}
            <CommentCard
              comment={comment}
              isOwner={user?.id === comment.userId}
              isEditing={editingId === comment._id}
              editContent={editContent}
              onEditStart={() => {
                setEditingId(comment._id);
                setEditContent(comment.content);
              }}
              onEditChange={setEditContent}
              onEditSave={() => handleEdit(comment._id)}
              onEditCancel={() => {
                setEditingId(null);
                setEditContent("");
              }}
              onDelete={() => handleDelete(comment._id)}
              onReply={() => setReplyingTo(comment._id)}
            />

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-12 space-y-3 border-l-2 border-border pl-4">
                {comment.replies.map((reply) => (
                  <CommentCard
                    key={reply._id}
                    comment={reply}
                    isOwner={user?.id === reply.userId}
                    isEditing={editingId === reply._id}
                    editContent={editContent}
                    onEditStart={() => {
                      setEditingId(reply._id);
                      setEditContent(reply.content);
                    }}
                    onEditChange={setEditContent}
                    onEditSave={() => handleEdit(reply._id)}
                    onEditCancel={() => {
                      setEditingId(null);
                      setEditContent("");
                    }}
                    onDelete={() => handleDelete(reply._id)}
                    isReply
                  />
                ))}
              </div>
            )}

            {/* Reply Form */}
            {replyingTo === comment._id && isSignedIn && (
              <div className="ml-12 flex gap-3">
                <img
                  src={user?.imageUrl}
                  alt={user?.fullName || "User"}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Write a reply..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px] resize-none text-sm"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReplyingTo(null);
                        setNewComment("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSubmit(comment._id)}
                      disabled={!newComment.trim()}
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {comments?.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </div>
  );
}

// Individual Comment Card
interface CommentCardProps {
  comment: {
    _id: Id<"blogComments">;
    userName: string;
    userImage?: string;
    content: string;
    createdAt: number;
    isEdited: boolean;
    isDeleted: boolean;
  };
  isOwner: boolean;
  isEditing: boolean;
  editContent: string;
  onEditStart: () => void;
  onEditChange: (value: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onDelete: () => void;
  onReply?: () => void;
  isReply?: boolean;
}

function CommentCard({
  comment,
  isOwner,
  isEditing,
  editContent,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel,
  onDelete,
  onReply,
  isReply = false,
}: CommentCardProps) {
  const timeAgo = getTimeAgo(comment.createdAt);

  return (
    <div className="flex gap-3">
      <img
        src={comment.userImage || "/placeholder-avatar.png"}
        alt={comment.userName}
        className={`rounded-full ${isReply ? "w-8 h-8" : "w-10 h-10"}`}
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{comment.userName}</span>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
          {comment.isEdited && !comment.isDeleted && (
            <span className="text-xs text-muted-foreground">(edited)</span>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => onEditChange(e.target.value)}
              className="min-h-[60px] resize-none text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={onEditSave}>
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={onEditCancel}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className={`text-sm mt-1 ${comment.isDeleted ? "italic text-muted-foreground" : ""}`}>
            {comment.content}
          </p>
        )}

        {!isEditing && !comment.isDeleted && (
          <div className="flex items-center gap-2 mt-2">
            {onReply && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onReply}>
                Reply
              </Button>
            )}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={onEditStart}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function
function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return new Date(timestamp).toLocaleDateString();
}
