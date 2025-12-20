"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Users,
  UserPlus,
  Settings,
  LogOut,
  Sparkles,
  Bell,
  Bot,
  FileText,
  Plus,
  LayoutGrid,
  MoreHorizontal,
  Trash2,
  Edit3,
  Archive,
  Loader2,
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Tag,
  UtensilsCrossed,
  MessageSquare,
  Share2,
  Check,
} from "lucide-react";

// Board member type
interface BoardMember {
  userId: string;
  email?: string;
  name?: string;
  avatar?: string;
  role: "owner" | "admin" | "member" | "viewer";
  addedAt: number;
}

// jKanban type definitions
interface JKanbanItem {
  id: string;
  title: string;
  class?: string[];
  click?: (el: HTMLElement) => void;
  drag?: (el: HTMLElement, source: HTMLElement) => void;
  dragend?: (el: HTMLElement) => void;
  drop?: (el: HTMLElement, target: HTMLElement, source: HTMLElement, sibling: HTMLElement | null) => void;
  [key: string]: unknown;
}

interface JKanbanBoard {
  id: string;
  title: string;
  class?: string;
  dragTo?: string[];
  item: JKanbanItem[];
}

interface JKanbanOptions {
  element: string;
  gutter?: string;
  widthBoard?: string;
  responsivePercentage?: boolean;
  dragItems?: boolean;
  boards: JKanbanBoard[];
  dragBoards?: boolean;
  itemAddOptions?: {
    enabled: boolean;
    content?: string;
    class?: string;
    footer?: boolean;
  };
  itemHandleOptions?: {
    enabled: boolean;
    handleClass?: string;
    customCssHandler?: string;
    customCssIconHandler?: string;
    customHandler?: string;
  };
  click?: (el: HTMLElement) => void;
  dragEl?: (el: HTMLElement, source: HTMLElement) => void;
  dragendEl?: (el: HTMLElement) => void;
  dropEl?: (el: HTMLElement, target: HTMLElement, source: HTMLElement, sibling: HTMLElement | null) => void | boolean;
  dragBoard?: (el: HTMLElement, source: HTMLElement) => void;
  dragendBoard?: (el: HTMLElement) => void;
  dropBoard?: (el: HTMLElement, target: HTMLElement, source: HTMLElement, sibling: HTMLElement | null) => void;
  buttonClick?: (el: HTMLElement, boardId: string) => void;
}

interface JKanbanInstance {
  init: () => void;
  addElement: (boardId: string, element: JKanbanItem) => JKanbanInstance;
  addBoards: (boards: JKanbanBoard[]) => JKanbanInstance;
  findElement: (id: string) => HTMLElement | null;
  replaceElement: (id: string, element: JKanbanItem) => JKanbanInstance;
  getParentBoardID: (id: string | HTMLElement) => string | null;
  findBoard: (id: string) => HTMLElement | null;
  getBoardElements: (id: string) => NodeList;
  removeElement: (id: string | HTMLElement) => JKanbanInstance;
  removeBoard: (id: string | HTMLElement) => JKanbanInstance;
  options: JKanbanOptions;
}

declare global {
  interface Window {
    jKanban: new (options: JKanbanOptions) => JKanbanInstance;
  }
}

// Linear-style status configurations
const statusConfig: Record<string, { icon: string; color: string; bgColor: string }> = {
  "Backlog": { 
    icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#6b7280" stroke-width="1.5" stroke-dasharray="2 2"/></svg>`,
    color: "#6b7280",
    bgColor: "rgba(107, 114, 128, 0.1)"
  },
  "To Do": { 
    icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#6b7280" stroke-width="1.5"/></svg>`,
    color: "#6b7280",
    bgColor: "rgba(107, 114, 128, 0.1)"
  },
  "In Progress": { 
    icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#f59e0b" stroke-width="1.5"/><path d="M7 4v3l2 1" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.1)"
  },
  "In Review": { 
    icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#8b5cf6" stroke-width="1.5"/><path d="M5 7h4M7 5v4" stroke="#8b5cf6" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.1)"
  },
  "Done": { 
    icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" fill="#5e5ce6" stroke="#5e5ce6" stroke-width="1.5"/><path d="M4.5 7l2 2 3.5-3.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    color: "#5e5ce6",
    bgColor: "rgba(94, 92, 230, 0.15)"
  },
  "Cancelled": { 
    icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#ef4444" stroke-width="1.5"/><path d="M5 5l4 4M9 5l-4 4" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    color: "#ef4444",
    bgColor: "rgba(239, 68, 68, 0.1)"
  },
};

// Priority configurations
const priorityConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  "urgent": { label: "Urgent", color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.15)" },
  "high": { label: "High", color: "#f97316", bgColor: "rgba(249, 115, 22, 0.15)" },
  "medium": { label: "Medium", color: "#eab308", bgColor: "rgba(234, 179, 8, 0.15)" },
  "low": { label: "Low", color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.15)" },
};

// Soft spring animation
const softSpringEasing = "cubic-bezier(0.25, 1.1, 0.4, 1)";

// CherryCap Logo
function CherryCapLogo() {
  return (
    <div className="size-8 rounded-full bg-gradient-to-br from-rose-400 to-red-600" />
  );
}

// Icon Navigation Button
function IconNavButton({
  children,
  isActive = false,
  label,
}: {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      className={`flex items-center justify-center rounded-lg size-10 min-w-10 transition-colors duration-300
        ${isActive ? "bg-neutral-800 text-white" : "hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300"}`}
      style={{ transitionTimingFunction: softSpringEasing }}
    >
      {children}
    </button>
  );
}

// Sidebar Navigation
function Sidebar() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <aside className="bg-[#0a0a0a] flex flex-col gap-2 items-center p-3 w-16 min-h-screen border-r border-neutral-800/50">
      <Link href="/" className="mb-4 mt-1">
        <CherryCapLogo />
      </Link>

      <div className="flex flex-col gap-1 w-full items-center">
        <Link href="/dashboard">
          <IconNavButton label="Profile">
            <User className="h-4 w-4" />
          </IconNavButton>
        </Link>
        <Link href="/dashboard/blog-editor">
          <IconNavButton label="Blog Editor">
            <FileText className="h-4 w-4" />
          </IconNavButton>
        </Link>
        <Link href="/dashboard/kanban">
          <IconNavButton isActive label="Kanban Boards">
            <LayoutGrid className="h-4 w-4" />
          </IconNavButton>
        </Link>
        <Link href="/dashboard/menu-maker">
          <IconNavButton label="Menu Maker">
            <UtensilsCrossed className="h-4 w-4" />
          </IconNavButton>
        </Link>
        <Link href="/dashboard/team">
          <IconNavButton label="Team">
            <Users className="h-4 w-4" />
          </IconNavButton>
        </Link>
        <Link href="/chat">
          <IconNavButton label="AI Assistant">
            <Bot className="h-4 w-4" />
          </IconNavButton>
        </Link>
      </div>

      <div className="flex-1" />

      <div className="flex flex-col gap-1 w-full items-center mb-2">
        <IconNavButton label="Settings">
          <Settings className="h-4 w-4" />
        </IconNavButton>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="mt-2">
              <Avatar className="h-8 w-8 border border-neutral-800 cursor-pointer hover:border-neutral-600 transition-colors">
                <AvatarImage src={user?.imageUrl || ""} alt={user?.fullName || "User"} />
                <AvatarFallback className="bg-neutral-800 text-white text-xs">
                  {user?.firstName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-neutral-900 border-neutral-800" align="start" side="right">
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-white hover:bg-neutral-800">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-neutral-800" />
            <DropdownMenuItem className="text-white hover:bg-neutral-800" onClick={() => signOut({ redirectUrl: "/" })}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

// Board Card Component (for board list)
function BoardCard({ 
  board, 
  onOpen,
  onDelete,
}: { 
  board: {
    _id: Id<"kanbanBoards">;
    name: string;
    description?: string;
    color?: string;
    updatedAt: number;
  };
  onOpen: () => void;
  onDelete: () => void;
}) {
  const formatDate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group relative bg-gradient-to-br from-neutral-900 to-neutral-900/50 border border-neutral-800/50 rounded-xl p-5 
        hover:border-neutral-700/50 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 cursor-pointer"
      onClick={onOpen}
    >
      {/* Color accent line */}
      <div 
        className="absolute top-0 left-4 right-4 h-px opacity-50"
        style={{ background: `linear-gradient(90deg, transparent, ${board.color || "#5e5ce6"}, transparent)` }}
      />
      
      {/* Menu */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="p-1.5 rounded-md hover:bg-neutral-800/80 transition-colors">
              <MoreHorizontal className="h-4 w-4 text-neutral-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-neutral-900 border-neutral-800" align="end">
            <DropdownMenuItem className="text-neutral-300 hover:bg-neutral-800 hover:text-white">
              <Edit3 className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem className="text-neutral-300 hover:bg-neutral-800 hover:text-white">
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-800" />
            <DropdownMenuItem 
              className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-start gap-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${board.color || "#5e5ce6"}20` }}
        >
          <LayoutGrid className="h-5 w-5" style={{ color: board.color || "#5e5ce6" }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-white truncate pr-8">{board.name}</h3>
          {board.description && (
            <p className="text-sm text-neutral-500 mt-0.5 line-clamp-1">{board.description}</p>
          )}
          <p className="text-xs text-neutral-600 mt-2">Updated {formatDate(board.updatedAt)}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Create Board Dialog
function CreateBoardDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (boardId: Id<"kanbanBoards">) => void;
}) {
  const { user } = useUser();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#5e5ce6");
  const [isCreating, setIsCreating] = useState(false);

  const createBoard = useMutation(api.kanban.createBoard);

  const colors = [
    "#5e5ce6", // Indigo (Linear-like)
    "#f43f5e", // Rose
    "#f97316", // Orange
    "#eab308", // Yellow
    "#22c55e", // Green
    "#14b8a6", // Teal
    "#3b82f6", // Blue
    "#8b5cf6", // Violet
    "#ec4899", // Pink
  ];

  const handleCreate = async () => {
    if (!name.trim() || !user?.id) return;
    
    setIsCreating(true);
    try {
      const boardId = await createBoard({
        userId: user.id,
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      });
      onSuccess(boardId);
      onOpenChange(false);
      setName("");
      setDescription("");
      setColor("#5e5ce6");
    } catch (error) {
      console.error("Failed to create board:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-900 border-neutral-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">Create project</DialogTitle>
          <DialogDescription className="text-neutral-500 text-sm">
            Projects help you organize and track related issues.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs text-neutral-400 uppercase tracking-wider">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              className="bg-neutral-800/50 border-neutral-700/50 text-white placeholder:text-neutral-600 focus:border-neutral-600 h-10"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-neutral-400 uppercase tracking-wider">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
              className="bg-neutral-800/50 border-neutral-700/50 text-white placeholder:text-neutral-600 focus:border-neutral-600 h-10"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-neutral-400 uppercase tracking-wider">Color</label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    color === c ? "ring-2 ring-white ring-offset-2 ring-offset-neutral-900 scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Label configurations
const labelConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  "bug": { label: "Bug", color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.15)" },
  "feature": { label: "Feature", color: "#8b5cf6", bgColor: "rgba(139, 92, 246, 0.15)" },
  "improvement": { label: "Improvement", color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.15)" },
  "documentation": { label: "Docs", color: "#14b8a6", bgColor: "rgba(20, 184, 166, 0.15)" },
  "design": { label: "Design", color: "#ec4899", bgColor: "rgba(236, 72, 153, 0.15)" },
};

// Add Task Dialog
function AddTaskDialog({
  open,
  onOpenChange,
  boardId,
  columnId,
  columnName,
  boardMembers,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: Id<"kanbanBoards">;
  columnId: Id<"kanbanColumns">;
  columnName: string;
  boardMembers?: BoardMember[];
  onSuccess: () => void;
}) {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("");
  const [labels, setLabels] = useState<string[]>([]);
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const createTask = useMutation(api.kanban.createTask);

  const handleCreate = async () => {
    if (!title.trim() || !user?.id) return;
    
    setIsCreating(true);
    try {
      await createTask({
        boardId,
        columnId,
        title: title.trim(),
        description: description.trim() || undefined,
        createdBy: user.id,
        priority: priority as "low" | "medium" | "high" | "urgent" | undefined,
        labels: labels.length > 0 ? labels : undefined,
        assignedTo: assignedTo.length > 0 ? assignedTo : undefined,
      });
      onSuccess();
      onOpenChange(false);
      setTitle("");
      setDescription("");
      setPriority("");
      setLabels([]);
      setAssignedTo([]);
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleLabel = (label: string) => {
    setLabels(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  const toggleAssignee = (userId: string) => {
    setAssignedTo(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const statusInfo = statusConfig[columnName] || statusConfig["To Do"];

  // Priority icons (signal bars style like Linear)
  const priorityIcons: Record<string, React.ReactNode> = {
    urgent: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="8" width="3" height="6" rx="1" />
        <rect x="5" y="5" width="3" height="9" rx="1" />
        <rect x="9" y="2" width="3" height="12" rx="1" />
        <rect x="13" y="0" width="3" height="14" rx="1" />
      </svg>
    ),
    high: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="8" width="3" height="6" rx="1" />
        <rect x="5" y="5" width="3" height="9" rx="1" />
        <rect x="9" y="2" width="3" height="12" rx="1" />
        <rect x="13" y="0" width="3" height="14" rx="1" opacity="0.3" />
      </svg>
    ),
    medium: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="8" width="3" height="6" rx="1" />
        <rect x="5" y="5" width="3" height="9" rx="1" />
        <rect x="9" y="2" width="3" height="12" rx="1" opacity="0.3" />
        <rect x="13" y="0" width="3" height="14" rx="1" opacity="0.3" />
      </svg>
    ),
    low: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="8" width="3" height="6" rx="1" />
        <rect x="5" y="5" width="3" height="9" rx="1" opacity="0.3" />
        <rect x="9" y="2" width="3" height="12" rx="1" opacity="0.3" />
        <rect x="13" y="0" width="3" height="14" rx="1" opacity="0.3" />
      </svg>
    ),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#131316] border-neutral-800/60 max-w-xl p-0 gap-0 overflow-hidden shadow-2xl shadow-black/50">
        {/* Header with gradient accent */}
        <div className="relative px-6 pt-6 pb-4">
          <div 
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${statusInfo.color}50, transparent)` }}
          />
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-white text-[15px] font-semibold flex items-center gap-3">
              <span 
                className="flex items-center justify-center w-5 h-5 opacity-90"
                dangerouslySetInnerHTML={{ __html: statusInfo.icon }} 
              />
              <span>New issue</span>
              <span 
                className="ml-auto text-xs font-normal px-2 py-0.5 rounded-md"
                style={{ backgroundColor: statusInfo.bgColor, color: statusInfo.color }}
              >
                {columnName}
              </span>
            </DialogTitle>
            <DialogDescription className="text-neutral-500 text-[13px] pl-8">
              Create a new issue to track work
            </DialogDescription>
          </DialogHeader>
        </div>
        
        {/* Content */}
        <div className="px-6 pb-5 space-y-5">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="bg-[#1a1a1f] border-neutral-800 text-white text-[15px] placeholder:text-neutral-600 focus:border-indigo-500/50 focus-visible:ring-1 focus-visible:ring-indigo-500/30 h-12 px-4 font-medium rounded-xl transition-all"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleCreate();
              }}
              autoFocus
            />
          </div>
          
          {/* Description Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about this issue..."
              rows={3}
              className="w-full bg-[#1a1a1f] border border-neutral-800 text-neutral-300 text-sm placeholder:text-neutral-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 px-4 py-3 rounded-xl resize-none transition-all outline-none"
            />
          </div>

          {/* Priority Selection */}
          <div className="space-y-3">
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              Priority
              {priority && (
                <button 
                  onClick={() => setPriority("")}
                  className="text-neutral-600 hover:text-neutral-400 transition-colors normal-case text-[10px] font-normal"
                >
                  Clear
                </button>
              )}
            </label>
            <div className="flex gap-2">
              {Object.entries(priorityConfig).map(([key, config]) => {
                const isSelected = priority === key;
                return (
                  <button
                    key={key}
                    onClick={() => setPriority(priority === key ? "" : key)}
                    className={`
                      group relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200
                      ${!isSelected ? "hover:scale-[1.02] active:scale-[0.98]" : "scale-[1.02]"}
                    `}
                    style={{ 
                      backgroundColor: isSelected ? config.bgColor : "#1a1a1f",
                      color: isSelected ? config.color : "#737373",
                      border: `1px solid ${isSelected ? config.color + "40" : "#262626"}`,
                      boxShadow: isSelected ? `0 0 20px ${config.color}20` : undefined,
                    }}
                  >
                    <span 
                      className="transition-transform group-hover:scale-110"
                      style={{ color: isSelected ? config.color : "#525252" }}
                    >
                      {priorityIcons[key]}
                    </span>
                    {config.label}
                    {isSelected && (
                      <motion.div
                        layoutId="priority-check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: config.color }}
                      >
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="white">
                          <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Labels Selection */}
          <div className="space-y-3">
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              Labels
              {labels.length > 0 && (
                <span className="text-neutral-600 font-normal">({labels.length})</span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(labelConfig).map(([key, config]) => {
                const isSelected = labels.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleLabel(key)}
                    className={`
                      relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200
                      hover:scale-[1.02] active:scale-[0.98]
                    `}
                    style={{ 
                      backgroundColor: isSelected ? config.bgColor : "#1a1a1f",
                      color: isSelected ? config.color : "#737373",
                      border: `1px solid ${isSelected ? config.color + "50" : "#262626"}`,
                    }}
                  >
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: config.color, opacity: isSelected ? 1 : 0.4 }}
                    />
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assignees Selection */}
          {boardMembers && boardMembers.length > 0 && (
            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                <Users className="h-3 w-3" />
                Assignees
                {assignedTo.length > 0 && (
                  <span className="text-neutral-600 font-normal">({assignedTo.length})</span>
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                {boardMembers.map((member) => {
                  const isSelected = assignedTo.includes(member.userId);
                  const initial = member.name?.charAt(0) || member.email?.charAt(0) || '?';
                  return (
                    <button
                      key={member.userId}
                      onClick={() => toggleAssignee(member.userId)}
                      className={`
                        relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200
                        hover:scale-[1.02] active:scale-[0.98]
                        ${isSelected ? 'ring-2 ring-indigo-500/50' : ''}
                      `}
                      style={{ 
                        backgroundColor: isSelected ? "rgba(99, 102, 241, 0.15)" : "#1a1a1f",
                        color: isSelected ? "#818cf8" : "#a3a3a3",
                        border: `1px solid ${isSelected ? "rgba(99, 102, 241, 0.4)" : "#262626"}`,
                      }}
                    >
                      {member.avatar ? (
                        <img src={member.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-semibold">
                          {initial.toUpperCase()}
                        </span>
                      )}
                      {member.name || member.email}
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-indigo-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0f0f12] border-t border-neutral-800/50">
          <div className="flex items-center gap-1 text-[11px] text-neutral-600">
            <kbd className="px-1.5 py-0.5 bg-neutral-800/50 rounded text-[10px] font-mono">⌘</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-neutral-800/50 rounded text-[10px] font-mono">↵</kbd>
            <span className="ml-1">to create</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-neutral-400 hover:text-white hover:bg-neutral-800 h-9 px-4 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!title.trim() || isCreating}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white h-9 px-5 font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-indigo-500/20"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create issue"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Task type for detail view
interface TaskData {
  _id: Id<"kanbanTasks">;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  labels?: string[];
  dueDate?: number;
  assignedTo?: string[];
  createdAt: number;
  updatedAt: number;
  columnName: string;
}

// Task Detail Modal
function TaskDetailModal({
  open,
  onOpenChange,
  task,
  onUpdate,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskData | null;
  onUpdate: (taskId: Id<"kanbanTasks">, updates: { title?: string; description?: string; priority?: "low" | "medium" | "high" | "urgent"; labels?: string[]; dueDate?: number }) => Promise<void>;
  onDelete: (taskId: Id<"kanbanTasks">) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<string>("");
  const [editLabels, setEditLabels] = useState<string[]>([]);
  const [editDueDate, setEditDueDate] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDescription(task.description || "");
      setEditPriority(task.priority || "");
      setEditLabels(task.labels || []);
      setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "");
    }
  }, [task]);

  if (!task) return null;

  const statusInfo = statusConfig[task.columnName] || statusConfig["To Do"];
  const priorityInfo = task.priority ? priorityConfig[task.priority] : null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(task._id, {
        title: editTitle,
        description: editDescription || undefined,
        priority: editPriority as "low" | "medium" | "high" | "urgent" | undefined,
        labels: editLabels.length > 0 ? editLabels : undefined,
        dueDate: editDueDate ? new Date(editDueDate).getTime() : undefined,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task._id);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: "numeric"
    });
  };

  const toggleLabel = (label: string) => {
    setEditLabels(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  // Priority icons
  const priorityIcons: Record<string, React.ReactNode> = {
    urgent: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="8" width="3" height="6" rx="1" />
        <rect x="5" y="5" width="3" height="9" rx="1" />
        <rect x="9" y="2" width="3" height="12" rx="1" />
        <rect x="13" y="0" width="3" height="14" rx="1" />
      </svg>
    ),
    high: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="8" width="3" height="6" rx="1" />
        <rect x="5" y="5" width="3" height="9" rx="1" />
        <rect x="9" y="2" width="3" height="12" rx="1" />
        <rect x="13" y="0" width="3" height="14" rx="1" opacity="0.3" />
      </svg>
    ),
    medium: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="8" width="3" height="6" rx="1" />
        <rect x="5" y="5" width="3" height="9" rx="1" />
        <rect x="9" y="2" width="3" height="12" rx="1" opacity="0.3" />
        <rect x="13" y="0" width="3" height="14" rx="1" opacity="0.3" />
      </svg>
    ),
    low: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="8" width="3" height="6" rx="1" />
        <rect x="5" y="5" width="3" height="9" rx="1" opacity="0.3" />
        <rect x="9" y="2" width="3" height="12" rx="1" opacity="0.3" />
        <rect x="13" y="0" width="3" height="14" rx="1" opacity="0.3" />
      </svg>
    ),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#131316] border-neutral-800/60 max-w-2xl p-0 gap-0 overflow-hidden shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-neutral-800/50">
          <div 
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${statusInfo.color}50, transparent)` }}
          />
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <span 
                className="flex items-center justify-center w-5 h-5 mt-0.5 opacity-90 flex-shrink-0"
                dangerouslySetInnerHTML={{ __html: statusInfo.icon }} 
              />
              {isEditing ? (
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-neutral-900/50 border-neutral-700/50 text-white text-lg font-semibold h-9 px-2"
                  autoFocus
                />
              ) : (
                <h2 className="text-lg font-semibold text-white leading-tight">{task.title}</h2>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-neutral-400 hover:text-white hover:bg-neutral-800 h-8 px-3"
                  >
                    <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-3"
                  >
                    {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="text-neutral-400 hover:text-white hover:bg-neutral-800 h-8 px-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving || !editTitle.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white h-8 px-3"
                  >
                    {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3 pl-8">
            <span 
              className="text-xs font-medium px-2 py-0.5 rounded-md"
              style={{ backgroundColor: statusInfo.bgColor, color: statusInfo.color }}
            >
              {task.columnName}
            </span>
            {priorityInfo && (
              <span 
                className="text-xs font-medium px-2 py-0.5 rounded-md flex items-center gap-1.5"
                style={{ backgroundColor: priorityInfo.bgColor, color: priorityInfo.color }}
              >
                {priorityIcons[task.priority!]}
                {priorityInfo.label}
              </span>
            )}
            {task.dueDate && (
              <span className="text-xs text-neutral-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Description */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Description</label>
            {isEditing ? (
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Add a description..."
                rows={4}
                className="w-full bg-neutral-900/50 border border-neutral-800 text-neutral-300 text-sm placeholder:text-neutral-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 px-4 py-3 rounded-xl resize-none transition-all outline-none"
              />
            ) : (
              <p className="text-sm text-neutral-400 leading-relaxed">
                {task.description || <span className="text-neutral-600 italic">No description</span>}
              </p>
            )}
          </div>

          {/* Labels */}
          <div className="space-y-3">
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              <Tag className="h-3 w-3" />
              Labels
            </label>
            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                {Object.entries(labelConfig).map(([key, config]) => {
                  const isSelected = editLabels.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleLabel(key)}
                      className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      style={{ 
                        backgroundColor: isSelected ? config.bgColor : "#1a1a1f",
                        color: isSelected ? config.color : "#737373",
                        border: `1px solid ${isSelected ? config.color + "50" : "#262626"}`,
                      }}
                    >
                      <span 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: config.color, opacity: isSelected ? 1 : 0.4 }}
                      />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {task.labels && task.labels.length > 0 ? (
                  task.labels.map((label) => {
                    const config = labelConfig[label];
                    if (!config) return null;
                    return (
                      <span
                        key={label}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                        style={{ backgroundColor: config.bgColor, color: config.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
                        {config.label}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-sm text-neutral-600 italic">No labels</span>
                )}
              </div>
            )}
          </div>

          {/* Priority (Edit mode only) */}
          {isEditing && (
            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Priority</label>
              <div className="flex gap-2">
                {Object.entries(priorityConfig).map(([key, config]) => {
                  const isSelected = editPriority === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setEditPriority(editPriority === key ? "" : key)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${!isSelected ? "hover:bg-neutral-800/60" : ""}`}
                      style={{ 
                        backgroundColor: isSelected ? config.bgColor : "#1a1a1f",
                        color: isSelected ? config.color : "#737373",
                        border: `1px solid ${isSelected ? config.color + "40" : "#262626"}`,
                      }}
                    >
                      <span style={{ color: isSelected ? config.color : "#525252" }}>
                        {priorityIcons[key]}
                      </span>
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Due Date (Edit mode only) */}
          {isEditing && (
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Due Date
              </label>
              <Input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="bg-neutral-900/50 border-neutral-800 text-neutral-300 h-10 px-3 rounded-lg w-48"
              />
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-neutral-800/50 space-y-2">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Clock className="h-3 w-3" />
              Created {formatDate(task.createdAt)}
            </div>
            {task.updatedAt !== task.createdAt && (
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <Edit3 className="h-3 w-3" />
                Updated {formatDate(task.updatedAt)}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Quick Add Inline Input Component
function QuickAddInput({
  columnId,
  columnName,
  boardId,
  onClose,
  onSuccess,
}: {
  columnId: Id<"kanbanColumns">;
  columnName: string;
  boardId: Id<"kanbanBoards">;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const createTask = useMutation(api.kanban.createTask);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCreate = async () => {
    if (!title.trim() || !user?.id) return;
    
    setIsCreating(true);
    try {
      await createTask({
        boardId,
        columnId,
        title: title.trim(),
        createdBy: user.id,
      });
      setTitle("");
      onSuccess();
      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const statusInfo = statusConfig[columnName] || statusConfig["To Do"];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="bg-[#171717] border border-neutral-700/80 rounded-lg p-3 shadow-xl shadow-black/30"
    >
      <div className="flex items-start gap-2">
        <span 
          className="flex items-center justify-center w-4 h-4 mt-1.5 opacity-70 flex-shrink-0"
          dangerouslySetInnerHTML={{ __html: statusInfo.icon }} 
        />
        <div className="flex-1">
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Issue title..."
            disabled={isCreating}
            className="w-full bg-transparent border-none outline-none text-[13px] text-white placeholder:text-neutral-500 font-medium"
          />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/50">
            <span className="text-[10px] text-neutral-600">
              Press <kbd className="px-1 py-0.5 bg-neutral-800/50 rounded text-[9px] font-mono">Enter</kbd> to create, <kbd className="px-1 py-0.5 bg-neutral-800/50 rounded text-[9px] font-mono">Esc</kbd> to cancel
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onClose}
                className="px-2 py-1 text-[11px] text-neutral-500 hover:text-white hover:bg-neutral-800/50 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim() || isCreating}
                className="px-2.5 py-1 text-[11px] font-medium bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white rounded transition-colors"
              >
                {isCreating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// jKanban Board View
function JKanbanBoardView({ 
  boardId, 
  onBack 
}: { 
  boardId: Id<"kanbanBoards">; 
  onBack: () => void;
}) {
  const { user } = useUser();
  const kanbanRef = useRef<JKanbanInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isJKanbanLoaded, setIsJKanbanLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [filterLabel, setFilterLabel] = useState<string>("");
  const [filterAssignee, setFilterAssignee] = useState<string>("");
  const [showMyTasks, setShowMyTasks] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showTeamPanel, setShowTeamPanel] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [quickAddColumn, setQuickAddColumn] = useState<{ id: Id<"kanbanColumns">; name: string } | null>(null);
  const [addTaskDialog, setAddTaskDialog] = useState<{
    open: boolean;
    columnId: Id<"kanbanColumns"> | null;
    columnName: string;
  }>({ open: false, columnId: null, columnName: "" });

  const board = useQuery(api.kanban.getBoard, { boardId });
  const moveTask = useMutation(api.kanban.moveTask);
  const updateTask = useMutation(api.kanban.updateTask);
  const deleteTask = useMutation(api.kanban.deleteTask);

  // Search input ref for keyboard shortcut
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        // Allow Escape to blur input
        if (e.key === "Escape") {
          (target as HTMLInputElement).blur();
        }
        return;
      }

      // C - Create new issue (opens dialog for first column)
      if (e.key === "c" && !e.metaKey && !e.ctrlKey && board?.columns[0]) {
        e.preventDefault();
        setAddTaskDialog({
          open: true,
          columnId: board.columns[0]._id,
          columnName: board.columns[0].name,
        });
      }

      // / - Focus search
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // F - Toggle filters
      if (e.key === "f" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowFilters(prev => !prev);
      }

      // Escape - Close filters/modals
      if (e.key === "Escape") {
        if (showFilters) {
          setShowFilters(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [board, showFilters]);

  // Task data map for click handling
  const taskDataMapRef = useRef<Map<string, TaskData>>(new Map());

  // Handle task update
  const handleUpdateTask = async (taskId: Id<"kanbanTasks">, updates: { 
    title?: string; 
    description?: string; 
    priority?: "low" | "medium" | "high" | "urgent"; 
    labels?: string[]; 
    dueDate?: number 
  }) => {
    try {
      await updateTask({ taskId, ...updates });
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  // Handle task delete
  const handleDeleteTask = async (taskId: Id<"kanbanTasks">) => {
    try {
      await deleteTask({ taskId });
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  // Filter tasks based on search and filters
  const getFilteredBoard = useCallback(() => {
    if (!board) return null;
    
    const hasFilters = searchQuery || filterPriority || filterLabel || filterAssignee || showMyTasks;
    if (!hasFilters) return board;

    return {
      ...board,
      columns: board.columns.map(column => ({
        ...column,
        tasks: column.tasks.filter(task => {
          // Search filter
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesTitle = task.title.toLowerCase().includes(query);
            const matchesDesc = task.description?.toLowerCase().includes(query);
            if (!matchesTitle && !matchesDesc) return false;
          }
          
          // Priority filter
          if (filterPriority && task.priority !== filterPriority) return false;
          
          // Label filter
          if (filterLabel && (!task.labels || !task.labels.includes(filterLabel))) return false;
          
          // Assignee filter
          if (filterAssignee && (!task.assignedTo || !task.assignedTo.includes(filterAssignee))) return false;
          
          // My Tasks filter
          if (showMyTasks && user?.id && (!task.assignedTo || !task.assignedTo.includes(user.id))) return false;
          
          return true;
        })
      }))
    };
  }, [board, searchQuery, filterPriority, filterLabel, filterAssignee, showMyTasks, user?.id]);

  const filteredBoard = getFilteredBoard();

  // Load jKanban script dynamically
  useEffect(() => {
    if (typeof window !== "undefined" && !window.jKanban) {
      // Load CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/jkanban/jkanban.css";
      document.head.appendChild(link);

      // Load JS
      const script = document.createElement("script");
      script.src = "/jkanban/jkanban.js";
      script.onload = () => setIsJKanbanLoaded(true);
      document.body.appendChild(script);

      return () => {
        document.head.removeChild(link);
        document.body.removeChild(script);
      };
    } else if (window.jKanban) {
      setIsJKanbanLoaded(true);
    }
  }, []);

  // Column ID to Convex ID mapping
  const columnIdMapRef = useRef<Map<string, Id<"kanbanColumns">>>(new Map());
  const taskIdMapRef = useRef<Map<string, Id<"kanbanTasks">>>(new Map());

  // Handle task drop
  const handleDrop = useCallback(async (
    el: HTMLElement,
    target: HTMLElement,
    _source: HTMLElement,
    _sibling: HTMLElement | null
  ) => {
    const taskEid = el.getAttribute("data-eid");
    const targetBoardId = target.parentElement?.getAttribute("data-id");

    if (!taskEid || !targetBoardId) return;

    const taskId = taskIdMapRef.current.get(taskEid);
    const targetColumnId = columnIdMapRef.current.get(targetBoardId);
    
    if (!taskId || !targetColumnId) return;

    // Calculate new order based on position in target
    const targetItems = target.querySelectorAll(".kanban-item");
    let newOrder = 0;
    for (let i = 0; i < targetItems.length; i++) {
      if (targetItems[i] === el) {
        newOrder = i;
        break;
      }
    }

    try {
      await moveTask({
        taskId,
        targetColumnId,
        newOrder,
      });
    } catch (error) {
      console.error("Failed to move task:", error);
    }
  }, [moveTask]);

  // Handle task click
  const handleTaskClick = useCallback((el: HTMLElement) => {
    const taskEid = el.getAttribute("data-eid");
    if (!taskEid) return;
    
    const taskData = taskDataMapRef.current.get(taskEid);
    if (taskData) {
      setSelectedTask(taskData);
      setTaskDetailOpen(true);
    }
  }, []);

  // Get status icon and color for a column
  const getStatusConfig = (columnName: string) => {
    return statusConfig[columnName] || statusConfig["To Do"];
  };

  // Initialize jKanban when data is ready
  useEffect(() => {
    if (!isJKanbanLoaded || !filteredBoard || !containerRef.current) return;

    // Clear any existing kanban
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    // Clear maps
    columnIdMapRef.current.clear();
    taskIdMapRef.current.clear();
    taskDataMapRef.current.clear();

    // Convert Convex data to jKanban format
    const jkanbanBoards: JKanbanBoard[] = filteredBoard.columns.map((column) => {
      // Store column ID mapping
      const columnStringId = `col-${column._id}`;
      columnIdMapRef.current.set(columnStringId, column._id);
      
      const status = getStatusConfig(column.name);

      return {
        id: columnStringId,
        title: `<div class="linear-column-header">
          <div class="linear-column-icon">${status.icon}</div>
          <span class="linear-column-title">${column.name}</span>
          <span class="linear-column-count">${column.tasks.length}</span>
        </div>`,
        class: `linear-board,linear-board-${column.name.toLowerCase().replace(/\s+/g, '-')}`,
        item: column.tasks.map((task) => {
          // Store task ID mapping
          const taskStringId = `task-${task._id}`;
          taskIdMapRef.current.set(taskStringId, task._id);
          
          // Store full task data for click handling
          taskDataMapRef.current.set(taskStringId, {
            _id: task._id,
            title: task.title,
            description: task.description,
            priority: task.priority,
            labels: task.labels,
            dueDate: task.dueDate,
            assignedTo: task.assignedTo,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            columnName: column.name,
          });
          
          const priorityInfo = task.priority ? priorityConfig[task.priority] : null;
          const hasLabels = task.labels && task.labels.length > 0;
          const hasDueDate = task.dueDate;
          const hasAssignees = task.assignedTo && task.assignedTo.length > 0;
          
          // Get assignee info from board members
          const getAssigneeInfo = (userId: string) => {
            const member = filteredBoard.members?.find(m => m.userId === userId);
            return member || { userId, name: undefined, avatar: undefined, email: '' };
          };
          
          // Format due date
          const formatDueDate = (timestamp: number) => {
            const date = new Date(timestamp);
            const now = new Date();
            const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) return `<span style="color: #ef4444;">Overdue</span>`;
            if (diffDays === 0) return `<span style="color: #f59e0b;">Today</span>`;
            if (diffDays === 1) return `<span style="color: #f59e0b;">Tomorrow</span>`;
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          };
          
          // Generate assignee avatars HTML
          const assigneeAvatarsHtml = hasAssignees ? `
            <div class="linear-task-assignees">
              ${task.assignedTo!.slice(0, 3).map(userId => {
                const info = getAssigneeInfo(userId);
                const initial = info.name?.charAt(0) || info.email?.charAt(0) || '?';
                if (info.avatar) {
                  return `<img src="${info.avatar}" alt="${info.name || 'Assignee'}" class="linear-assignee-avatar" title="${info.name || info.email}" />`;
                }
                return `<span class="linear-assignee-avatar linear-assignee-fallback" title="${info.name || info.email}">${initial.toUpperCase()}</span>`;
              }).join('')}
              ${task.assignedTo!.length > 3 ? `<span class="linear-assignee-more">+${task.assignedTo!.length - 3}</span>` : ''}
            </div>
          ` : '';

          return {
            id: taskStringId,
            title: `<div class="linear-task" data-task-id="${taskStringId}">
              <div class="linear-task-header">
                <div class="linear-task-status">${status.icon}</div>
                <span class="linear-task-title">${task.title}</span>
              </div>
              ${task.description ? `<p class="linear-task-desc">${task.description}</p>` : ""}
              <div class="linear-task-footer">
                <div class="linear-task-meta">
                  ${priorityInfo ? `<span class="linear-task-priority" style="background: ${priorityInfo.bgColor}; color: ${priorityInfo.color};">${priorityInfo.label}</span>` : ""}
                  ${hasLabels ? task.labels!.map(label => {
                    const labelInfo = labelConfig[label];
                    if (!labelInfo) return '';
                    return `<span class="linear-task-label" style="background: ${labelInfo.bgColor}; color: ${labelInfo.color};">
                      <span class="linear-label-dot" style="background: ${labelInfo.color};"></span>
                      ${labelInfo.label}
                    </span>`;
                  }).join('') : ''}
                  ${hasDueDate ? `<span class="linear-task-due"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>${formatDueDate(task.dueDate!)}</span>` : ''}
                </div>
                ${assigneeAvatarsHtml}
              </div>
            </div>`,
          };
        }),
      };
    });

    // Initialize jKanban
    kanbanRef.current = new window.jKanban({
      element: "#jkanban-container",
      gutter: "12px",
      widthBoard: "320px",
      responsivePercentage: false,
      dragItems: true,
      boards: jkanbanBoards,
      dragBoards: false,
      itemAddOptions: {
        enabled: true,
        content: "+ New issue",
        class: "linear-add-btn",
        footer: true,
      },
      dropEl: (el, target, source, sibling) => {
        handleDrop(el, target, source, sibling);
      },
      click: handleTaskClick,
      buttonClick: (_el, columnBoardId) => {
        const columnId = columnIdMapRef.current.get(columnBoardId);
        const column = filteredBoard.columns.find(c => `col-${c._id}` === columnBoardId);
        if (columnId && column) {
          setAddTaskDialog({
            open: true,
            columnId,
            columnName: column.name,
          });
        }
      },
    });

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      kanbanRef.current = null;
    };
  }, [isJKanbanLoaded, filteredBoard, handleDrop, handleTaskClick]);

  if (!board) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex items-center gap-3 text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  const totalIssues = board.columns.reduce((acc, col) => acc + col.tasks.length, 0);
  const filteredIssues = filteredBoard?.columns.reduce((acc, col) => acc + col.tasks.length, 0) || 0;
  const hasActiveFilters = searchQuery || filterPriority || filterLabel || filterAssignee || showMyTasks;

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0a] overflow-hidden">
      {/* Board Header - Linear style */}
      <div className="px-6 py-3 border-b border-neutral-800/50 flex items-center gap-3 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-10">
        <button
          onClick={onBack}
          className="p-1.5 rounded-md hover:bg-neutral-800/50 text-neutral-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="h-4 w-px bg-neutral-800" />
        <div 
          className="w-5 h-5 rounded flex items-center justify-center"
          style={{ backgroundColor: `${board.color || "#5e5ce6"}20` }}
        >
          <LayoutGrid className="h-3 w-3" style={{ color: board.color || "#5e5ce6" }} />
        </div>
        <h1 className="text-sm font-medium text-white">{board.name}</h1>
        {board.description && (
          <>
            <span className="text-neutral-600">·</span>
            <span className="text-sm text-neutral-500">{board.description}</span>
          </>
        )}
        <div className="flex-1" />
        
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issues..."
            className="w-48 h-8 pl-9 pr-8 bg-neutral-900/50 border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-700 rounded-lg"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-neutral-700 rounded"
            >
              <X className="h-3 w-3 text-neutral-500" />
            </button>
          ) : (
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-neutral-800/50 rounded text-[10px] text-neutral-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">/</kbd>
          )}
        </div>

        {/* Filter Button */}
        <div className="relative group/filter">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-8 px-3 text-xs gap-1.5 ${hasActiveFilters ? 'text-indigo-400 bg-indigo-500/10' : 'text-neutral-400 hover:text-white'}`}
          >
            <Filter className="h-3.5 w-3.5" />
            Filter
            {hasActiveFilters ? (
              <span className="px-1.5 py-0.5 bg-indigo-500/20 rounded text-[10px]">
                {(filterPriority ? 1 : 0) + (filterLabel ? 1 : 0)}
              </span>
            ) : (
              <kbd className="px-1 py-0.5 bg-neutral-800/50 rounded text-[10px] text-neutral-600 font-mono opacity-0 group-hover/filter:opacity-100 transition-opacity">F</kbd>
            )}
          </Button>

          {/* Filter Dropdown */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-72 bg-gradient-to-b from-[#1c1c21] to-[#18181c] border border-neutral-800/80 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800/50 bg-neutral-900/30">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-neutral-500" />
                    <span className="text-xs font-semibold text-neutral-300">Filters</span>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={() => {
                        setFilterPriority("");
                        setFilterLabel("");
                        setFilterAssignee("");
                        setShowMyTasks(false);
                      }}
                      className="text-[11px] text-neutral-500 hover:text-indigo-400 transition-colors flex items-center gap-1"
                    >
                      <X className="h-3 w-3" />
                      Clear all
                    </button>
                  )}
                </div>

                <div className="p-4 space-y-4">
                  {/* Priority Filter */}
                  <div>
                    <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block mb-2.5 flex items-center gap-2">
                      <AlertCircle className="h-3 w-3" />
                      Priority
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(priorityConfig).map(([key, config]) => {
                        const isSelected = filterPriority === key;
                        return (
                          <button
                            key={key}
                            onClick={() => setFilterPriority(filterPriority === key ? "" : key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                              isSelected ? 'scale-[1.02] shadow-lg' : 'hover:scale-[1.02]'
                            }`}
                            style={{
                              backgroundColor: isSelected ? config.bgColor : "rgba(38, 38, 38, 0.4)",
                              color: isSelected ? config.color : "#a3a3a3",
                              border: `1px solid ${isSelected ? config.color + "50" : "rgba(64, 64, 64, 0.4)"}`,
                              boxShadow: isSelected ? `0 4px 12px ${config.color}20` : undefined,
                            }}
                          >
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Label Filter */}
                  <div>
                    <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block mb-2.5 flex items-center gap-2">
                      <Tag className="h-3 w-3" />
                      Label
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(labelConfig).map(([key, config]) => {
                        const isSelected = filterLabel === key;
                        return (
                          <button
                            key={key}
                            onClick={() => setFilterLabel(filterLabel === key ? "" : key)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
                              isSelected ? 'scale-[1.02] shadow-lg' : 'hover:scale-[1.02]'
                            }`}
                            style={{
                              backgroundColor: isSelected ? config.bgColor : "rgba(38, 38, 38, 0.4)",
                              color: isSelected ? config.color : "#a3a3a3",
                              border: `1px solid ${isSelected ? config.color + "50" : "rgba(64, 64, 64, 0.4)"}`,
                              boxShadow: isSelected ? `0 4px 12px ${config.color}20` : undefined,
                            }}
                          >
                            <span 
                              className="w-2 h-2 rounded-full transition-transform"
                              style={{ 
                                backgroundColor: config.color, 
                                opacity: isSelected ? 1 : 0.5,
                                transform: isSelected ? 'scale(1.1)' : 'scale(1)'
                              }}
                            />
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Assignee Filter */}
                  {board?.members && board.members.length > 1 && (
                    <div>
                      <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block mb-2.5 flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        Assignee
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {board.members.map((member) => {
                          const isSelected = filterAssignee === member.userId;
                          const initial = member.name?.charAt(0) || member.email?.charAt(0) || '?';
                          return (
                            <button
                              key={member.userId}
                              onClick={() => setFilterAssignee(filterAssignee === member.userId ? "" : member.userId)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
                                isSelected ? 'scale-[1.02] shadow-lg' : 'hover:scale-[1.02]'
                              }`}
                              style={{
                                backgroundColor: isSelected ? "rgba(99, 102, 241, 0.15)" : "rgba(38, 38, 38, 0.4)",
                                color: isSelected ? "#818cf8" : "#a3a3a3",
                                border: `1px solid ${isSelected ? "rgba(99, 102, 241, 0.4)" : "rgba(64, 64, 64, 0.4)"}`,
                              }}
                            >
                              {member.avatar ? (
                                <img src={member.avatar} alt="" className="w-4 h-4 rounded-full" />
                              ) : (
                                <span className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[9px] font-semibold">
                                  {initial.toUpperCase()}
                                </span>
                              )}
                              {member.name || member.email?.split('@')[0]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer with keyboard hint */}
                <div className="px-4 py-2.5 border-t border-neutral-800/50 bg-neutral-900/30">
                  <span className="text-[10px] text-neutral-600">
                    Press <kbd className="px-1 py-0.5 bg-neutral-800/50 rounded font-mono">Esc</kbd> to close
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* My Tasks Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMyTasks(!showMyTasks)}
          className={`h-8 px-3 text-xs ${showMyTasks ? 'text-indigo-400 bg-indigo-500/10' : 'text-neutral-400 hover:text-white'}`}
        >
          <User className="h-3.5 w-3.5 mr-1.5" />
          My Tasks
        </Button>

        {/* Team Panel Toggle */}
        {board?.members && board.members.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTeamPanel(!showTeamPanel)}
            className={`h-8 px-3 text-xs ${showTeamPanel ? 'text-indigo-400 bg-indigo-500/10' : 'text-neutral-400 hover:text-white'}`}
          >
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Team
            <span className="ml-1.5 px-1.5 py-0.5 bg-neutral-800/50 rounded text-[10px]">
              {board.members.length}
            </span>
          </Button>
        )}

        <div className="h-4 w-px bg-neutral-800" />
        
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          {hasActiveFilters ? (
            <span>{filteredIssues} of {totalIssues} issues</span>
          ) : (
            <span>{totalIssues} issues</span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* jKanban Container */}
        <div className="flex-1 overflow-x-auto p-6">
          <div 
            id="jkanban-container" 
            ref={containerRef}
            className="jkanban-wrapper"
          />
        </div>

        {/* Team Panel */}
        <AnimatePresence>
          {showTeamPanel && board?.members && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="border-l border-neutral-800/50 bg-[#0c0c0c] overflow-hidden flex-shrink-0"
            >
              <div className="w-[280px] h-full flex flex-col">
                {/* Panel Header */}
                <div className="px-4 py-3 border-b border-neutral-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm font-medium text-white">Team Members</span>
                  </div>
                  <button
                    onClick={() => setShowTeamPanel(false)}
                    className="p-1 hover:bg-neutral-800 rounded transition-colors"
                  >
                    <X className="h-4 w-4 text-neutral-500" />
                  </button>
                </div>

                {/* Members List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                  {board.members.map((member) => {
                    const initial = member.name?.charAt(0) || member.email?.charAt(0) || '?';
                    const isCurrentUser = member.userId === user?.id;
                    return (
                      <div
                        key={member.userId}
                        className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                          isCurrentUser ? 'bg-indigo-500/10' : 'hover:bg-neutral-800/50'
                        }`}
                      >
                        {member.avatar ? (
                          <img src={member.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-semibold">
                            {initial.toUpperCase()}
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white truncate">
                              {member.name || member.email?.split('@')[0]}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[10px] text-indigo-400">(you)</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                            <span className="capitalize">{member.role}</span>
                            {member.email && (
                              <>
                                <span>·</span>
                                <span className="truncate">{member.email}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Member Button */}
                {board.userId === user?.id && (
                  <div className="p-3 border-t border-neutral-800/50">
                    <Button
                      variant="ghost"
                      className="w-full h-9 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 justify-start"
                    >
                      <UserPlus className="h-3.5 w-3.5 mr-2" />
                      Invite team member
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Keyboard Shortcuts Bar */}
      <div className="px-6 py-2.5 border-t border-neutral-800/30 bg-[#0a0a0a]/50 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-6 text-[11px] text-neutral-600">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-neutral-800/50 rounded font-mono text-[10px]">C</kbd>
            <span>New issue</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-neutral-800/50 rounded font-mono text-[10px]">/</kbd>
            <span>Search</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-neutral-800/50 rounded font-mono text-[10px]">F</kbd>
            <span>Filter</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-neutral-800/50 rounded font-mono text-[10px]">Esc</kbd>
            <span>Close</span>
          </span>
        </div>
      </div>

      {/* Linear-style CSS for jKanban */}
      <style jsx global>{`
        .jkanban-wrapper {
          min-height: 100%;
        }
        
        .kanban-container {
          display: flex;
          gap: 12px;
          padding-bottom: 20px;
        }
        
        /* Board/Column Styles */
        .kanban-board {
          background: transparent !important;
          border: none !important;
          border-radius: 0 !important;
          min-width: 320px;
        }
        
        .kanban-board-header {
          background: transparent !important;
          padding: 0 0 12px 0 !important;
          border-bottom: none !important;
        }
        
        .linear-column-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 8px;
          border-radius: 6px;
          transition: background 0.15s ease;
        }
        
        .linear-column-header:hover {
          background: rgba(255, 255, 255, 0.03);
        }
        
        .linear-column-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .linear-column-title {
          color: #e5e5e5;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: -0.01em;
        }
        
        .linear-column-count {
          color: #525252;
          font-size: 12px;
          font-weight: 400;
          margin-left: auto;
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 6px;
          border-radius: 4px;
        }
        
        /* Task Container */
        .kanban-drag {
          background: transparent !important;
          padding: 0 !important;
          min-height: 60px !important;
          border-radius: 8px;
        }
        
        /* Task Card Styles */
        .kanban-item {
          background: linear-gradient(180deg, #191919 0%, #151515 100%) !important;
          border: 1px solid rgba(38, 38, 38, 0.9) !important;
          border-radius: 10px !important;
          padding: 0 !important;
          margin-bottom: 8px !important;
          cursor: grab !important;
          transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
          overflow: hidden;
          position: relative;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        
        .kanban-item:hover {
          background: linear-gradient(180deg, #1e1e1e 0%, #1a1a1a 100%) !important;
          border-color: rgba(70, 70, 70, 0.9) !important;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.03) !important;
          transform: translateY(-2px);
        }
        
        .kanban-item.is-moving {
          opacity: 0.95 !important;
          transform: rotate(1.5deg) scale(1.02) !important;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(94, 92, 230, 0.15) !important;
          border-color: rgba(94, 92, 230, 0.5) !important;
          z-index: 100;
        }
        
        .kanban-item:active {
          cursor: grabbing !important;
          transform: scale(0.99);
        }
        
        /* Linear Task Styles */
        .linear-task {
          padding: 12px 14px;
        }
        
        .linear-task-header {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        
        .linear-task-status {
          flex-shrink: 0;
          margin-top: 2px;
          opacity: 0.8;
        }
        
        .linear-task-title {
          color: #f5f5f5;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.5;
          letter-spacing: -0.01em;
          flex: 1;
        }
        
        .linear-task-desc {
          color: #737373;
          font-size: 12px;
          line-height: 1.5;
          margin: 6px 0 0 24px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .linear-task-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 10px;
          margin-left: 24px;
          gap: 8px;
        }
        
        .linear-task-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          flex: 1;
        }
        
        .linear-task-priority {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: capitalize;
        }
        
        .linear-task-label {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 10px;
        }
        
        .linear-label-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }
        
        .linear-task-due {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #737373;
        }
        
        .linear-task-due svg {
          opacity: 0.7;
        }
        
        /* Assignee Avatars */
        .linear-task-assignees {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        
        .linear-assignee-avatar {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid #171717;
          margin-left: -6px;
          object-fit: cover;
        }
        
        .linear-assignee-avatar:first-child {
          margin-left: 0;
        }
        
        .linear-assignee-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          font-size: 10px;
          font-weight: 600;
        }
        
        .linear-assignee-more {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #262626;
          color: #a3a3a3;
          font-size: 9px;
          font-weight: 500;
          margin-left: -6px;
          border: 2px solid #171717;
        }
        
        /* Add Button Styles */
        .kanban-board footer {
          padding: 4px 0 0 0 !important;
        }
        
        .linear-add-btn {
          width: 100% !important;
          background: transparent !important;
          border: none !important;
          border-radius: 6px !important;
          color: #525252 !important;
          font-size: 13px !important;
          font-weight: 400 !important;
          padding: 8px 10px !important;
          margin: 0 !important;
          cursor: pointer !important;
          transition: all 0.15s ease !important;
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
          text-align: left !important;
        }
        
        .linear-add-btn:hover {
          color: #a3a3a3 !important;
          background: rgba(255, 255, 255, 0.03) !important;
        }
        
        .linear-add-icon {
          font-size: 16px;
          line-height: 1;
          opacity: 0.7;
        }
        
        /* Disabled Board State */
        .disabled-board {
          opacity: 0.3 !important;
          pointer-events: none !important;
        }
        
        /* Scrollbar Styles */
        .kanban-drag::-webkit-scrollbar {
          width: 6px;
        }
        
        .kanban-drag::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .kanban-drag::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        
        .kanban-drag::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        /* Gu styles for dragula ghost */
        .gu-mirror {
          position: fixed !important;
          margin: 0 !important;
          z-index: 9999 !important;
          opacity: 0.9 !important;
          transform: rotate(2deg) !important;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5) !important;
        }
        
        .gu-hide {
          display: none !important;
        }
        
        .gu-unselectable {
          user-select: none !important;
        }
        
        .gu-transit {
          opacity: 0.3 !important;
        }
      `}</style>

      {/* Add Task Dialog */}
      {addTaskDialog.columnId && (
        <AddTaskDialog
          open={addTaskDialog.open}
          onOpenChange={(open) => setAddTaskDialog(prev => ({ ...prev, open }))}
          boardId={boardId}
          columnId={addTaskDialog.columnId}
          columnName={addTaskDialog.columnName}
          boardMembers={board?.members}
          onSuccess={() => {
            // The board will automatically refresh via Convex subscription
          }}
        />
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        open={taskDetailOpen}
        onOpenChange={setTaskDetailOpen}
        task={selectedTask}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}

// Boards List View
function BoardsListView() {
  const { user } = useUser();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Id<"kanbanBoards"> | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<Id<"kanbanBoards"> | null>(null);

  const boards = useQuery(
    api.kanban.getBoards,
    user?.id ? { userId: user.id } : "skip"
  );

  const deleteBoard = useMutation(api.kanban.deleteBoard);

  const handleDeleteBoard = async () => {
    if (!boardToDelete) return;
    try {
      await deleteBoard({ boardId: boardToDelete });
      setDeleteConfirmOpen(false);
      setBoardToDelete(null);
    } catch (error) {
      console.error("Failed to delete board:", error);
    }
  };

  if (selectedBoard) {
    return <JKanbanBoardView boardId={selectedBoard} onBack={() => setSelectedBoard(null)} />;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-semibold text-white">Projects</h1>
            <p className="text-sm text-neutral-500 mt-0.5">Manage your team&apos;s projects and tasks</p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white h-9 px-4 text-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New project
          </Button>
        </motion.div>

        {/* Boards Grid */}
        {boards === undefined ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-neutral-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading projects...</span>
            </div>
          </div>
        ) : boards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            {/* Illustration */}
            <div className="relative w-48 h-32 mx-auto mb-6">
              {/* Floating cards illustration */}
              <motion.div 
                initial={{ y: 10, rotate: -8 }}
                animate={{ y: [10, 0, 10], rotate: -8 }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-4 top-4 w-20 h-24 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-lg border border-neutral-700/50 shadow-xl"
              >
                <div className="p-2 space-y-1.5">
                  <div className="h-2 w-10 bg-neutral-700 rounded" />
                  <div className="h-1.5 w-14 bg-neutral-800 rounded" />
                  <div className="h-1.5 w-8 bg-neutral-800 rounded" />
                </div>
              </motion.div>
              <motion.div 
                initial={{ y: 0, rotate: 4 }}
                animate={{ y: [-5, 5, -5], rotate: 4 }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                className="absolute left-1/2 -translate-x-1/2 top-0 w-24 h-28 bg-gradient-to-br from-indigo-900/40 to-indigo-950/40 rounded-lg border border-indigo-500/30 shadow-xl shadow-indigo-500/10"
              >
                <div className="p-2.5 space-y-1.5">
                  <div className="h-2 w-12 bg-indigo-600/40 rounded" />
                  <div className="h-1.5 w-16 bg-indigo-900/40 rounded" />
                  <div className="h-1.5 w-10 bg-indigo-900/40 rounded" />
                  <div className="h-1.5 w-6 bg-indigo-500/30 rounded mt-3" />
                </div>
              </motion.div>
              <motion.div 
                initial={{ y: 5, rotate: 12 }}
                animate={{ y: [5, -5, 5], rotate: 12 }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                className="absolute right-4 top-6 w-20 h-24 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-lg border border-neutral-700/50 shadow-xl"
              >
                <div className="p-2 space-y-1.5">
                  <div className="h-2 w-8 bg-neutral-700 rounded" />
                  <div className="h-1.5 w-12 bg-neutral-800 rounded" />
                  <div className="h-1.5 w-10 bg-neutral-800 rounded" />
                </div>
              </motion.div>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-sm text-neutral-500 mb-6 max-w-xs mx-auto">
              Projects help you organize tasks and track progress. Create your first one to get started.
            </p>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white h-10 px-5 text-sm font-medium shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create your first project
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {boards.map((board, i) => (
                <motion.div
                  key={board._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <BoardCard
                    board={board}
                    onOpen={() => setSelectedBoard(board._id)}
                    onDelete={() => {
                      setBoardToDelete(board._id);
                      setDeleteConfirmOpen(true);
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <CreateBoardDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={(boardId) => setSelectedBoard(boardId)}
        />

        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="bg-neutral-900 border-neutral-800 max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-white">Delete project</DialogTitle>
              <DialogDescription className="text-neutral-500">
                This will permanently delete the project and all its issues. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="ghost"
                onClick={() => setDeleteConfirmOpen(false)}
                className="text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteBoard}
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                Delete project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Main Kanban Page
export default function KanbanPage() {
  return (
    <div className="flex flex-col min-h-screen text-white">
      <header className="flex items-center justify-between px-6 py-3 border-b border-neutral-800/50 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-500">Workspace</span>
          <span className="text-neutral-700">/</span>
          <span className="text-white font-medium">Projects</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-md hover:bg-neutral-800/50 transition-colors">
            <Bell className="h-4 w-4 text-neutral-500" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
          </button>
          <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 h-8 text-xs">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Upgrade
          </Button>
        </div>
      </header>

      <BoardsListView />
    </div>
  );
}
