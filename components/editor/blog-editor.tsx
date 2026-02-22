"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Undo,
  Redo,
  Sparkles,
  ChevronDown,
  Wand2,
  Scissors,
  Expand,
  RefreshCw,
  CheckCircle,
  Briefcase,
  MessageCircle,
  Lightbulb,
  FileText,
  Loader2,
  TrendingUp,
  Eye,
  X,
  Search,
  Send,
  Hash,
  Target,
  Copy,
  Check,
  Image as ImageIcon,
  Flame,
  Zap,
  Leaf,
  Calendar,
  ArrowRight,
  Users,
  BarChart3,
  ChevronRight,
  Clock,
  Filter,
  Star,
  Bot,
  Rocket,
  Twitter,
  FileCheck,
  Tag,
  PenTool,
  Settings2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface BlogEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onTitleChange?: (title: string) => void;
  initialTitle?: string;
  className?: string;
}

interface Trend {
  title: string;
  views: string;
  category: string;
  growth: string;
  type: "trending" | "rising" | "evergreen" | "seasonal";
  difficulty: "easy" | "medium" | "hard";
  keywords: string[];
  searchIntent: string;
  contentAngles: string[];
  targetAudience: string;
  estimatedWordCount: number;
  competitorGap: string;
}

interface TrendsResponse {
  trends: Trend[];
  relatedTopics: string[];
  trendingSummary: string;
}

const AI_COMMANDS = [
  { id: "improve", label: "Improve Writing", icon: Wand2 },
  { id: "shorten", label: "Make Shorter", icon: Scissors },
  { id: "expand", label: "Expand", icon: Expand },
  { id: "paraphrase", label: "Paraphrase", icon: RefreshCw },
  { id: "grammar", label: "Fix Grammar", icon: CheckCircle },
  { id: "formal", label: "Make Formal", icon: Briefcase },
  { id: "casual", label: "Make Casual", icon: MessageCircle },
  { id: "simplify", label: "Simplify", icon: Lightbulb },
  { id: "summarize", label: "Summarize", icon: FileText },
];

// AI Models with pricing (per 1M tokens) for credit calculation
// Prices from OpenRouter - we apply a 3x markup for user credits
const AI_MODELS = {
  "google/gemini-3-pro-preview": { name: "Gemini 3 Pro", tier: "premium", inputPrice: 1.25, outputPrice: 10, description: "Best for writing" },
  "google/gemini-3-flash-preview": { name: "Gemini 3 Flash", tier: "standard", inputPrice: 0.1, outputPrice: 0.4, description: "Fast & capable" },
  "google/gemini-2.5-flash": { name: "Gemini 2.5", tier: "budget", inputPrice: 0.05, outputPrice: 0.15, description: "Cost effective" },
  "openai/gpt-4.1": { name: "GPT-4.1", tier: "premium", inputPrice: 2, outputPrice: 8, description: "OpenAI flagship" },
  "openai/gpt-4.1-mini": { name: "GPT-4.1 Mini", tier: "budget", inputPrice: 0.1, outputPrice: 0.3, description: "Affordable GPT" },
  "x-ai/grok-3-mini": { name: "Grok 3", tier: "standard", inputPrice: 0.3, outputPrice: 0.5, description: "X/Twitter AI" },
} as const;

// Credit multiplier - we charge 3x the actual API cost
const CREDIT_MULTIPLIER = 3;

// Platform word count standards (2024/2025 best practices)
const PLATFORM_STANDARDS = {
  twitter: { name: "X", maxChars: 280, idealWords: 40, hashtagLimit: 2, icon: "twitter" },
  instagram: { name: "Instagram", maxChars: 2200, idealWords: 150, hashtagLimit: 30, icon: "instagram" },
  facebook: { name: "Facebook", maxChars: 63206, idealWords: 80, hashtagLimit: 3, icon: "facebook" },
} as const;

type Platform = keyof typeof PLATFORM_STANDARDS;

export function BlogEditor({
  initialContent = "",
  onContentChange,
  onTitleChange,
  initialTitle = "",
  className,
}: BlogEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<keyof typeof AI_MODELS>("google/gemini-3-flash-preview");
  const [ghostText, setGhostText] = useState("");
  const ghostTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const onContentChangeRef = useRef(onContentChange);
  const ghostSpanRef = useRef<HTMLSpanElement | null>(null);
  
  // Trend finder state
  const [showTrends, setShowTrends] = useState(false);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);
  const [trendTopic, setTrendTopic] = useState("");
  const [relatedTopics, setRelatedTopics] = useState<string[]>([]);
  const [trendingSummary, setTrendingSummary] = useState("");
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [trendFilter, setTrendFilter] = useState<"all" | "trending" | "rising" | "evergreen" | "seasonal">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [isGeneratingFromTrend, setIsGeneratingFromTrend] = useState(false);
  
  // Auto Mode state
  const [showAutoMode, setShowAutoMode] = useState(false);
  const [autoModeTopic, setAutoModeTopic] = useState("");
  const [autoModeStyle, setAutoModeStyle] = useState<"informative" | "conversational" | "persuasive" | "storytelling">("informative");
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [autoModeStep, setAutoModeStep] = useState<"idle" | "researching" | "writing" | "done">("idle");
  const [autoModeResult, setAutoModeResult] = useState<{
    title: string;
    content: string;
    metaDescription: string;
    tags: string[];
    category: string;
    targetKeyword: string;
    socialMedia: {
      twitterPost: string;
      instagramCaption: string;
      facebookPost: string;
      hashtags: string[];
    };
    research: Record<string, unknown>;
  } | null>(null);
  
  // Auto Mode advanced options
  const [autoModeWordCount, setAutoModeWordCount] = useState<number>(1500);
  const [autoModeDepth, setAutoModeDepth] = useState<"overview" | "standard" | "deep-dive">("standard");
  const [autoModeIncludeSections, setAutoModeIncludeSections] = useState({
    intro: true,
    examples: true,
    stats: true,
    quotes: false,
    cta: true,
    faq: false,
  });
  const [autoModeTargetKeyword, setAutoModeTargetKeyword] = useState("");
  const [autoModeCustomCta, setAutoModeCustomCta] = useState("");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Auto Mode NEW advanced features
  const [autoModeTab, setAutoModeTab] = useState<"basic" | "keywords" | "format" | "advanced">("basic");
  const [autoModeFormat, setAutoModeFormat] = useState<"article" | "listicle" | "howto" | "casestudy" | "comparison" | "tutorial" | "review">("article");
  const [autoModeTone, setAutoModeTone] = useState<"professional" | "casual" | "humorous" | "authoritative" | "empathetic" | "urgent">("professional");
  const [autoModeAudience, setAutoModeAudience] = useState<"beginner" | "intermediate" | "expert" | "general">("general");
  const [autoModeSeoLevel, setAutoModeSeoLevel] = useState<"light" | "balanced" | "heavy">("balanced");
  const [autoModeModel, setAutoModeModel] = useState<string>("google/gemini-3-pro-preview");
  const [autoModeSecondaryKeywords, setAutoModeSecondaryKeywords] = useState<string[]>([]);
  const [autoModeKeywordInput, setAutoModeKeywordInput] = useState("");
  const [autoModeCompetitorUrls, setAutoModeCompetitorUrls] = useState<string[]>([]);
  const [autoModeCompetitorInput, setAutoModeCompetitorInput] = useState("");
  const [autoModeInternalLinks, setAutoModeInternalLinks] = useState(true);
  const [autoModeFeaturedSnippet, setAutoModeFeaturedSnippet] = useState(true);
  const [autoModeReadabilityLevel, setAutoModeReadabilityLevel] = useState<"simple" | "moderate" | "advanced">("moderate");
  const [autoModeLanguage, setAutoModeLanguage] = useState("en");
  const [autoModeOutlineFirst, setAutoModeOutlineFirst] = useState(false);
  const [autoModeGeneratedOutline, setAutoModeGeneratedOutline] = useState<string[] | null>(null);
  const [autoModeHookStyle, setAutoModeHookStyle] = useState<"question" | "statistic" | "story" | "bold" | "controversial">("question");

  // Publish modal state
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState<Platform | null>(null);
  
  // Image insertion modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  // Word count tracking
  const [currentWordCount, setCurrentWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  
  // Keep callback ref updated
  useEffect(() => {
    onContentChangeRef.current = onContentChange;
  }, [onContentChange]);

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    onTitleChange?.(e.target.value);
  };

  // Remove ghost text span from DOM
  const removeGhostSpan = useCallback(() => {
    if (ghostSpanRef.current && ghostSpanRef.current.parentNode) {
      ghostSpanRef.current.parentNode.removeChild(ghostSpanRef.current);
      ghostSpanRef.current = null;
    }
    setGhostText("");
  }, []);

  // Insert ghost text span at cursor position
  const insertGhostSpan = useCallback((text: string) => {
    removeGhostSpan();
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    
    // Create ghost span
    const ghostSpan = document.createElement("span");
    ghostSpan.className = "ghost-text";
    ghostSpan.contentEditable = "false";
    ghostSpan.style.cssText = "color: #666; font-style: italic; pointer-events: none; user-select: none;";
    ghostSpan.textContent = text;
    ghostSpan.dataset.ghost = "true";
    
    // Insert at cursor
    range.insertNode(ghostSpan);
    ghostSpanRef.current = ghostSpan;
    
    // Move cursor before the ghost span
    range.setStartBefore(ghostSpan);
    range.setEndBefore(ghostSpan);
    selection.removeAllRanges();
    selection.addRange(range);
    
    setGhostText(text);
  }, [removeGhostSpan]);

  // Fetch ghost text suggestion
  const fetchGhostText = useCallback(async () => {
    const text = editorRef.current?.innerText?.replace(/[\n\r]/g, ' ').trim() || "";
    if (!text || text.length < 10) {
      return;
    }

    // Get last ~100 characters for context (smaller = faster)
    const context = text.slice(-100);

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: context,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data.text && data.text !== "0" && data.text.trim()) {
        insertGhostSpan(data.text.trim());
      }
    } catch {
      // Ignore abort errors
    }
  }, [insertGhostSpan]);

  // Handle content change
  const handleInput = useCallback(() => {
    // Remove any existing ghost text
    removeGhostSpan();
    
    // Notify parent of content change (exclude ghost spans)
    const content = editorRef.current?.innerHTML?.replace(/<span[^>]*data-ghost="true"[^>]*>.*?<\/span>/g, '') || "";
    onContentChangeRef.current?.(content);
    
    // Update word and char count
    const text = editorRef.current?.innerText || "";
    const words = text.split(/\s+/).filter(Boolean).length;
    setCurrentWordCount(words);
    setCharCount(text.length);

    // Debounce ghost text fetch
    if (ghostTimeoutRef.current) {
      clearTimeout(ghostTimeoutRef.current);
    }

    ghostTimeoutRef.current = setTimeout(() => {
      fetchGhostText();
    }, 150);
  }, [fetchGhostText, removeGhostSpan]);

  // Accept ghost text with Tab + keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Ghost text acceptance
    if (e.key === "Tab" && ghostText && ghostSpanRef.current) {
      e.preventDefault();
      
      // Replace ghost span with real text
      const textNode = document.createTextNode(ghostText);
      ghostSpanRef.current.parentNode?.replaceChild(textNode, ghostSpanRef.current);
      ghostSpanRef.current = null;
      
      // Move cursor to end of inserted text
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      setGhostText("");
      
      // Notify content change
      const content = editorRef.current?.innerHTML || "";
      onContentChangeRef.current?.(content);
      return;
    }
    
    if (e.key === "Escape") {
      removeGhostSpan();
      return;
    }
    
    // Keyboard shortcuts (Ctrl/Cmd + key)
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          document.execCommand('bold', false);
          break;
        case 'i':
          e.preventDefault();
          document.execCommand('italic', false);
          break;
        case 'u':
          e.preventDefault();
          document.execCommand('underline', false);
          break;
        case 'k':
          e.preventDefault();
          const url = prompt("Enter URL:");
          if (url) document.execCommand('createLink', false, url);
          break;
        case 'z':
          if (e.shiftKey) {
            e.preventDefault();
            document.execCommand('redo', false);
          }
          break;
      }
    }
  }, [ghostText, removeGhostSpan]);

  // Format commands
  const execCommand = useCallback((command: string, value?: string) => {
    removeGhostSpan();
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, [removeGhostSpan]);

  const formatBold = () => execCommand("bold");
  const formatItalic = () => execCommand("italic");
  const formatUnderline = () => execCommand("underline");
  const formatStrikethrough = () => execCommand("strikeThrough");
  const formatCode = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      execCommand("insertHTML", `<code class="bg-neutral-800 px-1 py-0.5 rounded text-sm font-mono">${selection.toString()}</code>`);
    }
  };
  const formatH1 = () => execCommand("formatBlock", "h1");
  const formatH2 = () => execCommand("formatBlock", "h2");
  const formatH3 = () => execCommand("formatBlock", "h3");
  const formatBulletList = () => execCommand("insertUnorderedList");
  const formatNumberedList = () => execCommand("insertOrderedList");
  const formatBlockquote = () => execCommand("formatBlock", "blockquote");
  const formatUndo = () => execCommand("undo");
  const formatRedo = () => execCommand("redo");

  const formatLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  // AI command handler
  const handleAICommand = async (commandId: string) => {
    const selection = window.getSelection();
    const selectedText = selection?.toString();

    if (!selectedText) {
      alert("Please select some text first");
      return;
    }

    setIsProcessing(true);
    removeGhostSpan();

    try {
      const response = await fetch("/api/ai/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: commandId,
          text: selectedText,
          model: selectedModel,
        }),
      });

      if (!response.ok) throw new Error("Failed to process");

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

      // Replace selection with the result
      if (fullText && selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(fullText));
        
        // Notify content change
        const content = editorRef.current?.innerHTML || "";
        onContentChangeRef.current?.(content);
      }
    } catch (error) {
      console.error("AI command error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Fetch trends
  const fetchTrends = async () => {
    setIsLoadingTrends(true);
    setSelectedTrend(null);
    try {
      const response = await fetch("/api/ai/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: trendTopic || "general", type: trendFilter }),
      });

      if (!response.ok) throw new Error("Failed to fetch trends");

      const data: TrendsResponse = await response.json();
      setTrends(data.trends || []);
      setRelatedTopics(data.relatedTopics || []);
      setTrendingSummary(data.trendingSummary || "");
    } catch (error) {
      console.error("Trends error:", error);
      setTrends([]);
      setRelatedTopics([]);
      setTrendingSummary("");
    } finally {
      setIsLoadingTrends(false);
    }
  };

  // Filter trends by type and difficulty
  const filteredTrends = trends.filter(trend => {
    if (trendFilter !== "all" && trend.type !== trendFilter) return false;
    if (difficultyFilter !== "all" && trend.difficulty !== difficultyFilter) return false;
    return true;
  });

  // Use trend as title
  const useTrend = (trend: Trend) => {
    setTitle(trend.title);
    onTitleChange?.(trend.title);
    setShowTrends(false);
    setSelectedTrend(null);
  };

  // Generate full outline from trend
  const generateFromTrend = async (trend: Trend) => {
    setIsGeneratingFromTrend(true);
    try {
      const response = await fetch("/api/ai/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: "custom",
          text: trend.title,
          customPrompt: `Generate a comprehensive blog post outline for: "${trend.title}"

Context:
- Target audience: ${trend.targetAudience}
- Search intent: ${trend.searchIntent}
- Recommended word count: ${trend.estimatedWordCount} words
- Key angles to cover: ${trend.contentAngles.join(", ")}
- Gap to fill: ${trend.competitorGap}
- Keywords to include: ${trend.keywords.join(", ")}

Create a detailed outline with:
1. An attention-grabbing introduction hook
2. 5-7 main sections with H2 headings
3. 2-4 sub-points under each section
4. A compelling conclusion with CTA

Format using "##" for main headings and "-" for sub-points.
Make it actionable and comprehensive.`,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate outline");

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
        // Convert outline to HTML
        let html = "";
        const outlineItems = fullText.split("\n").map(line => line.trim()).filter(line => line.length > 0);
        
        for (const item of outlineItems) {
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

        // Set title and content
        setTitle(trend.title);
        onTitleChange?.(trend.title);
        
        if (editorRef.current) {
          editorRef.current.innerHTML = html;
          onContentChangeRef.current?.(html);
        }

        setShowTrends(false);
        setSelectedTrend(null);
      }
    } catch (error) {
      console.error("Failed to generate from trend:", error);
    } finally {
      setIsGeneratingFromTrend(false);
    }
  };

  // Auto Mode - fully automated content generation
  const runAutoMode = async () => {
    if (!autoModeTopic.trim()) return;

    setIsAutoGenerating(true);
    setAutoModeStep("researching");
    setAutoModeResult(null);

    try {
      const response = await fetch("/api/ai/auto-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: autoModeTopic,
          style: autoModeStyle,
          wordCount: autoModeWordCount,
          depth: autoModeDepth,
          includeSections: autoModeIncludeSections,
          targetKeyword: autoModeTargetKeyword || undefined,
          customCta: autoModeCustomCta || undefined,
          // New advanced options
          format: autoModeFormat,
          tone: autoModeTone,
          audience: autoModeAudience,
          seoLevel: autoModeSeoLevel,
          model: autoModeModel,
          secondaryKeywords: autoModeSecondaryKeywords.length > 0 ? autoModeSecondaryKeywords : undefined,
          competitorUrls: autoModeCompetitorUrls.length > 0 ? autoModeCompetitorUrls : undefined,
          enableInternalLinks: autoModeInternalLinks,
          optimizeForFeaturedSnippet: autoModeFeaturedSnippet,
          readabilityLevel: autoModeReadabilityLevel,
          language: autoModeLanguage,
          hookStyle: autoModeHookStyle,
          generateOutlineFirst: autoModeOutlineFirst,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate");

      setAutoModeStep("writing");

      const data = await response.json();

      if (data.success) {
        // If outline-first mode, show outline for review
        if (autoModeOutlineFirst && data.outline && !data.content) {
          setAutoModeGeneratedOutline(data.outline);
          setAutoModeStep("idle");
          return;
        }

        setAutoModeResult({
          title: data.title,
          content: data.content,
          metaDescription: data.metaDescription,
          tags: data.tags || [],
          category: data.category,
          targetKeyword: data.targetKeyword,
          socialMedia: data.socialMedia,
          research: data.research,
        });
        setAutoModeStep("done");
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (error) {
      console.error("Auto mode error:", error);
      setAutoModeStep("idle");
    } finally {
      setIsAutoGenerating(false);
    }
  };

  // Add secondary keyword
  const addSecondaryKeyword = () => {
    if (autoModeKeywordInput.trim() && autoModeSecondaryKeywords.length < 10) {
      setAutoModeSecondaryKeywords([...autoModeSecondaryKeywords, autoModeKeywordInput.trim()]);
      setAutoModeKeywordInput("");
    }
  };

  // Remove secondary keyword
  const removeSecondaryKeyword = (index: number) => {
    setAutoModeSecondaryKeywords(autoModeSecondaryKeywords.filter((_, i) => i !== index));
  };

  // Add competitor URL
  const addCompetitorUrl = () => {
    if (autoModeCompetitorInput.trim() && autoModeCompetitorUrls.length < 5) {
      setAutoModeCompetitorUrls([...autoModeCompetitorUrls, autoModeCompetitorInput.trim()]);
      setAutoModeCompetitorInput("");
    }
  };

  // Remove competitor URL
  const removeCompetitorUrl = (index: number) => {
    setAutoModeCompetitorUrls(autoModeCompetitorUrls.filter((_, i) => i !== index));
  };

  // Apply auto-generated content to editor
  const applyAutoContent = () => {
    if (!autoModeResult) return;
    
    setTitle(autoModeResult.title);
    onTitleChange?.(autoModeResult.title);
    
    if (editorRef.current) {
      editorRef.current.innerHTML = autoModeResult.content;
      onContentChangeRef.current?.(autoModeResult.content);
      
      // Update word count
      const text = editorRef.current.innerText || "";
      const words = text.split(/\s+/).filter(Boolean).length;
      setCurrentWordCount(words);
      setCharCount(text.length);
    }
    
    setShowAutoMode(false);
    setAutoModeResult(null);
    setAutoModeStep("idle");
    setAutoModeTopic("");
  };
  
  // Toggle platform selection
  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };
  
  // Generate hashtags using Gemini 3 Flash
  const generateHashtags = async () => {
    const text = editorRef.current?.innerText || "";
    if (!text || text.length < 20) {
      alert("Please write some content first to generate relevant hashtags");
      return;
    }
    
    setIsGeneratingHashtags(true);
    try {
      const response = await fetch("/api/ai/hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: text.slice(0, 1000),
          title,
          platforms: selectedPlatforms,
        }),
      });
      
      if (!response.ok) throw new Error("Failed to generate hashtags");
      
      const data = await response.json();
      setHashtags(data.hashtags || []);
    } catch (error) {
      console.error("Hashtag generation error:", error);
      setHashtags([]);
    } finally {
      setIsGeneratingHashtags(false);
    }
  };
  
  // Copy content for platform
  const copyForPlatform = async (platform: Platform) => {
    const text = editorRef.current?.innerText || "";
    const platformInfo = PLATFORM_STANDARDS[platform];
    
    // Prepare content with hashtags
    let content = text;
    if (hashtags.length > 0) {
      const hashtagText = hashtags.slice(0, platformInfo.hashtagLimit).join(" ");
      content = `${text}\n\n${hashtagText}`;
    }
    
    // Truncate if needed
    if (content.length > platformInfo.maxChars) {
      content = content.slice(0, platformInfo.maxChars - 3) + "...";
    }
    
    await navigator.clipboard.writeText(content);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };
  
  // Get word count status for platform
  const getWordCountStatus = (platform: Platform) => {
    const ideal = PLATFORM_STANDARDS[platform].idealWords;
    const ratio = currentWordCount / ideal;
    
    if (ratio < 0.5) return { color: "text-yellow-500", label: "Too short" };
    if (ratio > 1.5) return { color: "text-yellow-500", label: "Too long" };
    return { color: "text-green-500", label: "Good length" };
  };

  // Insert image into editor
  const insertImage = useCallback((url: string, alt: string) => {
    if (!url) return;
    
    removeGhostSpan();
    editorRef.current?.focus();
    
    const imgHtml = `<figure class="my-4"><img src="${url}" alt="${alt || 'Image'}" class="rounded-lg max-w-full h-auto" />${alt ? `<figcaption class="text-sm text-neutral-500 mt-2 text-center">${alt}</figcaption>` : ''}</figure>`;
    
    document.execCommand('insertHTML', false, imgHtml);
    
    // Notify content change
    const content = editorRef.current?.innerHTML || "";
    onContentChangeRef.current?.(content);
  }, [removeGhostSpan]);

  // Generate image with AI
  const handleGenerateImage = async () => {
    if (!imagePrompt) return;
    
    setIsGeneratingImage(true);
    try {
      const response = await fetch("/api/ai/menu-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${imagePrompt}. High quality, professional photography style.`,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
        }
      }
    } catch (error) {
      console.error("Failed to generate image:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Apply image from modal
  const handleApplyImage = () => {
    if (imageUrl) {
      insertImage(imageUrl, imageAlt);
      setShowImageModal(false);
      setImageUrl("");
      setImageAlt("");
      setImagePrompt("");
    }
  };

  // Initialize content - only on mount
  const initialContentRef = useRef(initialContent);
  useEffect(() => {
    if (editorRef.current && initialContentRef.current) {
      editorRef.current.innerHTML = initialContentRef.current;
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (ghostTimeoutRef.current) {
        clearTimeout(ghostTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Initialize word count on mount
  useEffect(() => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || "";
      const words = text.split(/\s+/).filter(Boolean).length;
      setCurrentWordCount(words);
      setCharCount(text.length);
    }
  }, []);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Title input with action buttons - mobile optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-3 sm:px-4 py-3 border-b border-neutral-800">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Your blog title..."
          className="flex-1 min-w-0 text-xl sm:text-3xl font-bold bg-transparent border-none outline-none text-white placeholder:text-neutral-500"
        />
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAutoMode(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Bot className="h-4 w-4" />
            <span>Auto</span>
          </button>
          <button
            onClick={() => setShowTrends(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-neutral-300 rounded-lg text-sm font-medium transition-colors"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="hidden xs:inline">Research</span>
            <span className="xs:hidden">Trends</span>
          </button>
        </div>
      </div>

      {/* Trends Modal */}
      {showTrends && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-800">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-neutral-800 rounded-xl">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-rose-400" />
                  </div>
                  Trend Research
                </h2>
                <p className="text-sm text-neutral-500 mt-1">Find trending topics and generate content ideas</p>
              </div>
              <button
                onClick={() => { setShowTrends(false); setSelectedTrend(null); }}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Section */}
            <div className="p-4 sm:p-5 border-b border-neutral-800 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                  <input
                    type="text"
                    value={trendTopic}
                    onChange={(e) => setTrendTopic(e.target.value)}
                    placeholder="Enter a topic (e.g., AI marketing, sustainable living)"
                    className="w-full pl-12 pr-4 py-3 text-base bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 outline-none focus:border-rose-500 transition-all"
                    onKeyDown={(e) => e.key === "Enter" && fetchTrends()}
                  />
                </div>
                <button
                  onClick={fetchTrends}
                  disabled={isLoadingTrends}
                  className="px-6 py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-neutral-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0"
                >
                  {isLoadingTrends ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      Research
                    </>
                  )}
                </button>
              </div>

              {/* Filters */}
              {trends.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-neutral-500 flex items-center gap-1">
                    <Filter className="h-3 w-3" />
                    Filter:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(["all", "trending", "rising", "evergreen", "seasonal"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setTrendFilter(type)}
                        className={cn(
                          "px-3 py-1 text-xs font-medium rounded-full transition-colors capitalize flex items-center gap-1",
                          trendFilter === type
                            ? "bg-rose-500 text-white"
                            : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                        )}
                      >
                        {type === "trending" && <Flame className="h-3 w-3" />}
                        {type === "rising" && <Zap className="h-3 w-3" />}
                        {type === "evergreen" && <Leaf className="h-3 w-3" />}
                        {type === "seasonal" && <Calendar className="h-3 w-3" />}
                        {type}
                      </button>
                    ))}
                  </div>
                  <div className="w-px h-4 bg-neutral-700 hidden sm:block" />
                  <div className="flex gap-1">
                    {(["all", "easy", "medium", "hard"] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setDifficultyFilter(diff)}
                        className={cn(
                          "px-3 py-1 text-xs font-medium rounded-full transition-colors capitalize",
                          difficultyFilter === diff
                            ? diff === "easy" ? "bg-green-500 text-white" 
                              : diff === "medium" ? "bg-yellow-500 text-black"
                              : diff === "hard" ? "bg-red-500 text-white"
                              : "bg-rose-500 text-white"
                            : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                        )}
                      >
                        {diff === "all" ? "All Difficulty" : diff}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex">
              {/* Left: Trends List */}
              <div className={cn(
                "flex-1 overflow-y-auto p-4 sm:p-5",
                selectedTrend ? "hidden lg:block lg:w-1/2 lg:border-r lg:border-neutral-800" : "w-full"
              )}>
                {/* Summary Banner */}
                {trendingSummary && (
                  <div className="mb-4 p-4 bg-neutral-800/50 border border-neutral-700 rounded-xl">
                    <div className="flex items-start gap-3">
                      <BarChart3 className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-neutral-200">Market Insight</p>
                        <p className="text-sm text-neutral-400 mt-1">{trendingSummary}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Related Topics */}
                {relatedTopics.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-neutral-500 mb-2">Related topics to explore:</p>
                    <div className="flex flex-wrap gap-2">
                      {relatedTopics.map((topic, i) => (
                        <button
                          key={i}
                          onClick={() => { setTrendTopic(topic); }}
                          className="px-3 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-full transition-colors"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trends Grid */}
                {filteredTrends.length > 0 ? (
                  <div className="grid gap-3">
                    {filteredTrends.map((trend, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedTrend(trend)}
                        className={cn(
                          "p-4 rounded-xl border cursor-pointer transition-all group",
                          selectedTrend === trend
                            ? "bg-rose-500/10 border-rose-500/50"
                            : "bg-neutral-800/50 border-neutral-700/50 hover:bg-neutral-800 hover:border-neutral-600"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              {/* Type badge */}
                              <span className={cn(
                                "px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full flex items-center gap-1",
                                trend.type === "trending" && "bg-orange-500/20 text-orange-400",
                                trend.type === "rising" && "bg-blue-500/20 text-blue-400",
                                trend.type === "evergreen" && "bg-green-500/20 text-green-400",
                                trend.type === "seasonal" && "bg-purple-500/20 text-purple-400"
                              )}>
                                {trend.type === "trending" && <Flame className="h-3 w-3" />}
                                {trend.type === "rising" && <Zap className="h-3 w-3" />}
                                {trend.type === "evergreen" && <Leaf className="h-3 w-3" />}
                                {trend.type === "seasonal" && <Calendar className="h-3 w-3" />}
                                {trend.type}
                              </span>
                              {/* Difficulty badge */}
                              <span className={cn(
                                "px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full",
                                trend.difficulty === "easy" && "bg-green-500/20 text-green-400",
                                trend.difficulty === "medium" && "bg-yellow-500/20 text-yellow-400",
                                trend.difficulty === "hard" && "bg-red-500/20 text-red-400"
                              )}>
                                {trend.difficulty}
                              </span>
                              <span className="text-xs text-neutral-500">{trend.category}</span>
                            </div>
                            <h3 className="font-semibold text-white group-hover:text-rose-400 transition-colors line-clamp-2">
                              {trend.title}
                            </h3>
                            {/* Keywords preview */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {trend.keywords?.slice(0, 3).map((kw, i) => (
                                <span key={i} className="px-2 py-0.5 text-[10px] bg-neutral-700/50 text-neutral-400 rounded">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="flex items-center gap-1 text-sm font-semibold text-neutral-300">
                              <Eye className="h-4 w-4" />
                              {trend.views}
                            </div>
                            <p className="text-sm font-medium text-green-400 mt-1">{trend.growth}</p>
                            <p className="text-xs text-neutral-500 mt-1">{trend.estimatedWordCount} words</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isLoadingTrends ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="h-10 w-10 animate-spin text-rose-500 mb-4" />
                    <p className="text-neutral-400">Analyzing trends...</p>
                    <p className="text-sm text-neutral-600 mt-1">This may take a few seconds</p>
                  </div>
                ) : trends.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 bg-neutral-800 rounded-2xl mb-4">
                      <TrendingUp className="h-12 w-12 text-neutral-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Discover What&apos;s Trending</h3>
                    <p className="text-sm text-neutral-500 max-w-sm">
                      Enter a topic above to find trending content ideas, search volumes, and competition levels
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-neutral-500">No trends match your filters</p>
                    <button
                      onClick={() => { setTrendFilter("all"); setDifficultyFilter("all"); }}
                      className="text-rose-400 text-sm mt-2 hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Trend Detail Panel */}
              {selectedTrend && (
                <div className="w-full lg:w-1/2 overflow-y-auto p-4 sm:p-5 bg-neutral-950/50">
                  {/* Back button on mobile */}
                  <button
                    onClick={() => setSelectedTrend(null)}
                    className="lg:hidden flex items-center gap-1 text-sm text-neutral-400 hover:text-white mb-4"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    Back to trends
                  </button>

                  {/* Detail Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn(
                        "px-2 py-0.5 text-xs font-semibold uppercase rounded-full flex items-center gap-1",
                        selectedTrend.type === "trending" && "bg-orange-500/20 text-orange-400",
                        selectedTrend.type === "rising" && "bg-blue-500/20 text-blue-400",
                        selectedTrend.type === "evergreen" && "bg-green-500/20 text-green-400",
                        selectedTrend.type === "seasonal" && "bg-purple-500/20 text-purple-400"
                      )}>
                        {selectedTrend.type === "trending" && <Flame className="h-3 w-3" />}
                        {selectedTrend.type === "rising" && <Zap className="h-3 w-3" />}
                        {selectedTrend.type === "evergreen" && <Leaf className="h-3 w-3" />}
                        {selectedTrend.type === "seasonal" && <Calendar className="h-3 w-3" />}
                        {selectedTrend.type}
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 text-xs font-semibold uppercase rounded-full",
                        selectedTrend.difficulty === "easy" && "bg-green-500/20 text-green-400",
                        selectedTrend.difficulty === "medium" && "bg-yellow-500/20 text-yellow-400",
                        selectedTrend.difficulty === "hard" && "bg-red-500/20 text-red-400"
                      )}>
                        {selectedTrend.difficulty} difficulty
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">{selectedTrend.title}</h2>
                    <p className="text-sm text-neutral-400">{selectedTrend.category}</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 bg-neutral-800/50 rounded-xl">
                      <div className="flex items-center gap-2 text-neutral-400 mb-1">
                        <Eye className="h-4 w-4" />
                        <span className="text-xs">Monthly Searches</span>
                      </div>
                      <p className="text-lg font-bold text-white">{selectedTrend.views}</p>
                    </div>
                    <div className="p-3 bg-neutral-800/50 rounded-xl">
                      <div className="flex items-center gap-2 text-neutral-400 mb-1">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs">Growth</span>
                      </div>
                      <p className="text-lg font-bold text-green-400">{selectedTrend.growth}</p>
                    </div>
                    <div className="p-3 bg-neutral-800/50 rounded-xl">
                      <div className="flex items-center gap-2 text-neutral-400 mb-1">
                        <Users className="h-4 w-4" />
                        <span className="text-xs">Target Audience</span>
                      </div>
                      <p className="text-sm font-medium text-white">{selectedTrend.targetAudience}</p>
                    </div>
                    <div className="p-3 bg-neutral-800/50 rounded-xl">
                      <div className="flex items-center gap-2 text-neutral-400 mb-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs">Recommended Length</span>
                      </div>
                      <p className="text-lg font-bold text-white">{selectedTrend.estimatedWordCount}</p>
                      <p className="text-xs text-neutral-500">words</p>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-neutral-300 mb-2 flex items-center gap-2">
                      <Hash className="h-4 w-4 text-rose-400" />
                      Target Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTrend.keywords?.map((kw, i) => (
                        <span key={i} className="px-3 py-1.5 text-sm bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-lg">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Search Intent */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-neutral-300 mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-400" />
                      Search Intent
                    </h4>
                    <span className="px-3 py-1.5 text-sm bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-lg capitalize">
                      {selectedTrend.searchIntent}
                    </span>
                  </div>

                  {/* Content Angles */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-neutral-300 mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-400" />
                      Content Angles
                    </h4>
                    <div className="space-y-2">
                      {selectedTrend.contentAngles?.map((angle, i) => (
                        <div key={i} className="flex items-start gap-2 p-3 bg-neutral-800/50 rounded-lg">
                          <Star className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                          <p className="text-sm text-neutral-300">{angle}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Competitor Gap */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-neutral-300 mb-2 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-purple-400" />
                      Opportunity Gap
                    </h4>
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <p className="text-sm text-purple-200">{selectedTrend.competitorGap}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => generateFromTrend(selectedTrend)}
                      disabled={isGeneratingFromTrend}
                      className="w-full py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-neutral-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {isGeneratingFromTrend ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5" />
                          Generate Outline
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => useTrend(selectedTrend)}
                      className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="h-4 w-4" />
                      Use Title Only
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auto Mode Modal - Enhanced with Tabs */}
      {showAutoMode && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-800">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl">
                    <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  Auto Mode Pro
                </h2>
                <p className="text-sm text-neutral-500 mt-1">AI-powered content creation with advanced SEO optimization</p>
              </div>
              <button
                onClick={() => { setShowAutoMode(false); setAutoModeResult(null); setAutoModeStep("idle"); setAutoModeTab("basic"); }}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs - Only show when idle */}
            {autoModeStep === "idle" && !autoModeResult && (
              <div className="flex border-b border-neutral-800 px-4 overflow-x-auto scrollbar-hide">
                {([
                  { id: "basic", label: "Topic & Style", icon: PenTool },
                  { id: "keywords", label: "Keywords", icon: Target },
                  { id: "format", label: "Format", icon: FileText },
                  { id: "advanced", label: "Advanced", icon: Settings2 },
                ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAutoModeTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                      autoModeTab === tab.id
                        ? "text-rose-400 border-rose-500"
                        : "text-neutral-400 border-transparent hover:text-white"
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {autoModeStep === "idle" && !autoModeResult && (
                <>
                  {/* Basic Tab */}
                  {autoModeTab === "basic" && (
                    <div className="space-y-6">
                      {/* Topic Input */}
                      <div>
                        <label className="text-sm font-medium text-neutral-300 mb-2 block">What topic should I write about?</label>
                        <input
                          type="text"
                          value={autoModeTopic}
                          onChange={(e) => setAutoModeTopic(e.target.value)}
                          placeholder="e.g., productivity tips for remote workers, AI in healthcare, sustainable fashion"
                          className="w-full px-4 py-3 text-base bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 outline-none focus:border-rose-500 transition-all"
                        />
                      </div>

                      {/* Writing Style */}
                      <div>
                        <label className="text-sm font-medium text-neutral-300 mb-2 block">Writing Style</label>
                        <div className="grid grid-cols-2 gap-2">
                          {([
                            { value: "informative", label: "Informative", desc: "Educational & factual", icon: FileCheck },
                            { value: "conversational", label: "Conversational", desc: "Friendly & engaging", icon: MessageCircle },
                            { value: "persuasive", label: "Persuasive", desc: "Compelling & action-driven", icon: Rocket },
                            { value: "storytelling", label: "Storytelling", desc: "Narrative & emotional", icon: PenTool },
                          ] as const).map((style) => (
                            <button
                              key={style.value}
                              onClick={() => setAutoModeStyle(style.value)}
                              className={cn(
                                "p-3 rounded-xl border text-left transition-all",
                                autoModeStyle === style.value
                                  ? "bg-rose-500/10 border-rose-500"
                                  : "bg-neutral-800/50 border-neutral-700 hover:border-neutral-600"
                              )}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <style.icon className={cn("h-4 w-4", autoModeStyle === style.value ? "text-rose-400" : "text-neutral-400")} />
                                <span className={cn("text-sm font-medium", autoModeStyle === style.value ? "text-white" : "text-neutral-300")}>{style.label}</span>
                              </div>
                              <p className="text-xs text-neutral-500">{style.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tone of Voice */}
                      <div>
                        <label className="text-sm font-medium text-neutral-300 mb-2 block">Tone of Voice</label>
                        <div className="flex flex-wrap gap-2">
                          {([
                            { value: "professional", label: "Professional" },
                            { value: "casual", label: "Casual" },
                            { value: "humorous", label: "Humorous" },
                            { value: "authoritative", label: "Authoritative" },
                            { value: "empathetic", label: "Empathetic" },
                            { value: "urgent", label: "Urgent" },
                          ] as const).map((tone) => (
                            <button
                              key={tone.value}
                              onClick={() => setAutoModeTone(tone.value)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg border text-sm transition-all",
                                autoModeTone === tone.value
                                  ? "bg-rose-500/10 border-rose-500 text-rose-400"
                                  : "bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:border-neutral-600"
                              )}
                            >
                              {tone.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Target Audience */}
                      <div>
                        <label className="text-sm font-medium text-neutral-300 mb-2 block">Target Audience</label>
                        <div className="grid grid-cols-4 gap-2">
                          {([
                            { value: "general", label: "General", desc: "Everyone" },
                            { value: "beginner", label: "Beginner", desc: "New to topic" },
                            { value: "intermediate", label: "Intermediate", desc: "Some knowledge" },
                            { value: "expert", label: "Expert", desc: "Advanced users" },
                          ] as const).map((aud) => (
                            <button
                              key={aud.value}
                              onClick={() => setAutoModeAudience(aud.value)}
                              className={cn(
                                "p-2 rounded-lg border text-center transition-all",
                                autoModeAudience === aud.value
                                  ? "bg-rose-500/10 border-rose-500"
                                  : "bg-neutral-800/50 border-neutral-700 hover:border-neutral-600"
                              )}
                            >
                              <span className={cn("text-sm font-medium block", autoModeAudience === aud.value ? "text-white" : "text-neutral-300")}>{aud.label}</span>
                              <span className="text-[10px] text-neutral-500">{aud.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Hook Style */}
                      <div>
                        <label className="text-sm font-medium text-neutral-300 mb-2 block">Opening Hook Style</label>
                        <div className="flex flex-wrap gap-2">
                          {([
                            { value: "question", label: "Question" },
                            { value: "statistic", label: "Shocking Stat" },
                            { value: "story", label: "Mini Story" },
                            { value: "bold", label: "Bold Statement" },
                            { value: "controversial", label: "Contrarian" },
                          ] as const).map((hook) => (
                            <button
                              key={hook.value}
                              onClick={() => setAutoModeHookStyle(hook.value)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg border text-sm transition-all",
                                autoModeHookStyle === hook.value
                                  ? "bg-purple-500/10 border-purple-500 text-purple-400"
                                  : "bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:border-neutral-600"
                              )}
                            >
                              {hook.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Keywords Tab */}
                  {autoModeTab === "keywords" && (
                    <div className="space-y-6">
                      {/* Primary Keyword */}
                      <div>
                        <label className="text-sm font-medium text-neutral-300 mb-2 block flex items-center gap-2">
                          <Target className="h-4 w-4 text-rose-400" />
                          Primary Keyword
                        </label>
                        <input
                          type="text"
                          value={autoModeTargetKeyword}
                          onChange={(e) => setAutoModeTargetKeyword(e.target.value)}
                          placeholder="Leave empty to let AI choose the best keyword"
                          className="w-full px-4 py-3 text-base bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 outline-none focus:border-rose-500 transition-all"
                        />
                        <p className="text-xs text-neutral-500 mt-1">The main keyword you want to rank for</p>
                      </div>

                      {/* Secondary Keywords */}
                      <div>
                        <label className="text-sm font-medium text-neutral-300 mb-2 block flex items-center gap-2">
                          <Hash className="h-4 w-4 text-blue-400" />
                          Secondary Keywords (LSI)
                        </label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={autoModeKeywordInput}
                            onChange={(e) => setAutoModeKeywordInput(e.target.value)}
                            placeholder="Add related keyword..."
                            className="flex-1 px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 outline-none focus:border-rose-500"
                            onKeyDown={(e) => e.key === "Enter" && addSecondaryKeyword()}
                          />
                          <button
                            onClick={addSecondaryKeyword}
                            disabled={!autoModeKeywordInput.trim() || autoModeSecondaryKeywords.length >= 10}
                            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        {autoModeSecondaryKeywords.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {autoModeSecondaryKeywords.map((kw, i) => (
                              <span key={i} className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full">
                                {kw}
                                <button onClick={() => removeSecondaryKeyword(i)} className="hover:text-white">
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-neutral-500 mt-2">Add up to 10 related keywords to include naturally</p>
                      </div>

                      {/* SEO Optimization Level */}
                      <div>
                        <label className="text-sm font-medium text-neutral-300 mb-2 block">SEO Optimization Level</label>
                        <div className="grid grid-cols-3 gap-2">
                          {([
                            { value: "light", label: "Light", desc: "Natural flow, less SEO focus" },
                            { value: "balanced", label: "Balanced", desc: "Good SEO + readability" },
                            { value: "heavy", label: "Heavy", desc: "Maximum SEO optimization" },
                          ] as const).map((level) => (
                            <button
                              key={level.value}
                              onClick={() => setAutoModeSeoLevel(level.value)}
                              className={cn(
                                "p-3 rounded-lg border text-center transition-all",
                                autoModeSeoLevel === level.value
                                  ? "bg-rose-500/10 border-rose-500"
                                  : "bg-neutral-800/50 border-neutral-700 hover:border-neutral-600"
                              )}
                            >
                              <span className={cn("text-sm font-medium block", autoModeSeoLevel === level.value ? "text-white" : "text-neutral-300")}>{level.label}</span>
                              <span className="text-[10px] text-neutral-500">{level.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* SEO Features */}
                      <div>
                        <label className="text-sm font-medium text-neutral-300 mb-2 block">SEO Features</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setAutoModeFeaturedSnippet(!autoModeFeaturedSnippet)}
                            className={cn(
                              "flex items-center gap-2 p-3 rounded-lg border text-sm transition-all",
                              autoModeFeaturedSnippet
                                ? "bg-green-500/10 border-green-500 text-white"
                                : "bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:border-neutral-600"
                            )}
                          >
                            <div className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center",
                              autoModeFeaturedSnippet ? "bg-green-500 border-green-500" : "border-neutral-600"
                            )}>
                              {autoModeFeaturedSnippet && <Check className="h-3 w-3 text-white" />}
                            </div>
                            Featured Snippet Optimization
                          </button>
                          <button
                            onClick={() => setAutoModeInternalLinks(!autoModeInternalLinks)}
                            className={cn(
                              "flex items-center gap-2 p-3 rounded-lg border text-sm transition-all",
                              autoModeInternalLinks
                                ? "bg-green-500/10 border-green-500 text-white"
                                : "bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:border-neutral-600"
                            )}
                          >
                            <div className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center",
                              autoModeInternalLinks ? "bg-green-500 border-green-500" : "border-neutral-600"
                            )}>
                              {autoModeInternalLinks && <Check className="h-3 w-3 text-white" />}
                            </div>
                            Internal Link Suggestions
                          </button>
                        </div>
                      </div>

                      {/* Competitor URLs */}
                      <div>
                        <label className="text-sm font-medium text-neutral-300 mb-2 block flex items-center gap-2">
                          <Users className="h-4 w-4 text-orange-400" />
                          Competitor URLs to Outrank (optional)
                        </label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={autoModeCompetitorInput}
                            onChange={(e) => setAutoModeCompetitorInput(e.target.value)}
                            placeholder="https://competitor.com/article"
                            className="flex-1 px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 outline-none focus:border-rose-500"
                            onKeyDown={(e) => e.key === "Enter" && addCompetitorUrl()}
                          />
                          <button
                            onClick={addCompetitorUrl}
                            disabled={!autoModeCompetitorInput.trim() || autoModeCompetitorUrls.length >= 5}
                            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        {autoModeCompetitorUrls.length > 0 && (
                          <div className="space-y-1">
                            {autoModeCompetitorUrls.map((url, i) => (
                              <div key={i} className="flex items-center justify-between px-3 py-2 bg-orange-500/10 rounded-lg">
                                <span className="text-xs text-orange-300 truncate">{url}</span>
                                <button onClick={() => removeCompetitorUrl(i)} className="text-orange-400 hover:text-white">
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-neutral-500 mt-2">AI will analyze and create better content</p>
                      </div>
                    </div>
                  )}

                  {/* Format Tab */}
                  {autoModeTab === "format" && (
                    <div className="space-y-6">
                      {/* Content Format */}
                      <div>
                        <label className="text-sm font-medium text-neutral-300 mb-2 block">Content Format</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {([
                            { value: "article", label: "Standard Article", desc: "Classic blog post format" },
                            { value: "listicle", label: "Listicle", desc: "Numbered list format (10 Ways...)" },
                            { value: "howto", label: "How-To Guide", desc: "Step-by-step tutorial" },
                            { value: "casestudy", label: "Case Study", desc: "In-depth analysis" },
                            { value: "comparison", label: "Comparison", desc: "X vs Y format" },
                            { value: "tutorial", label: "Tutorial", desc: "Hands-on learning" },
                            { value: "review", label: "Review", desc: "Product/service review" },
                          ] as const).map((format) => (
                            <button
                              key={format.value}
                              onClick={() => setAutoModeFormat(format.value)}
                              className={cn(
                                "p-3 rounded-xl border text-left transition-all",
                                autoModeFormat === format.value
                                  ? "bg-rose-500/10 border-rose-500"
                                  : "bg-neutral-800/50 border-neutral-700 hover:border-neutral-600"
                              )}
                            >
                              <span className={cn("text-sm font-medium block", autoModeFormat === format.value ? "text-white" : "text-neutral-300")}>{format.label}</span>
                              <span className="text-[10px] text-neutral-500">{format.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Word Count */}
                      <div>
                        <label className="text-sm font-medium text-neutral-300 mb-2 block">Target Word Count: {autoModeWordCount.toLocaleString()}</label>
                        <input
                          type="range"
                          min={500}
                          max={5000}
                          step={100}
                          value={autoModeWordCount}
                          onChange={(e) => setAutoModeWordCount(parseInt(e.target.value))}
                          className="w-full accent-rose-500"
                        />
                        <div className="flex justify-between text-xs text-neutral-500 mt-1">
                          <span>500 (Short)</span>
                          <span>2,500 (Medium)</span>
                          <span>5,000 (Long)</span>
                        </div>
                      </div>

                      {/* Content Depth */}
                      <div>
                        <label className="text-sm font-medium text-neutral-300 mb-2 block">Content Depth</label>
                        <div className="grid grid-cols-3 gap-2">
                          {([
                            { value: "overview", label: "Overview", desc: "Quick & concise" },
                            { value: "standard", label: "Standard", desc: "Balanced depth" },
                            { value: "deep-dive", label: "Deep Dive", desc: "Comprehensive" },
                          ] as const).map((depth) => (
                            <button
                              key={depth.value}
                              onClick={() => setAutoModeDepth(depth.value)}
                              className={cn(
                                "p-3 rounded-lg border text-center transition-all",
                                autoModeDepth === depth.value
                                  ? "bg-rose-500/10 border-rose-500"
                                  : "bg-neutral-800/50 border-neutral-700 hover:border-neutral-600"
                              )}
                            >
                              <span className={cn("text-sm font-medium block", autoModeDepth === depth.value ? "text-white" : "text-neutral-300")}>{depth.label}</span>
                              <span className="text-[10px] text-neutral-500">{depth.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Include Sections */}
                      <div>
                        <label className="text-sm font-medium text-neutral-300 mb-2 block">Include Sections</label>
                        <div className="grid grid-cols-2 gap-2">
                          {([
                            { key: "examples", label: "Examples & Cases" },
                            { key: "stats", label: "Statistics & Data" },
                            { key: "quotes", label: "Expert Quotes" },
                            { key: "faq", label: "FAQ Section" },
                            { key: "cta", label: "Call-to-Action" },
                            { key: "intro", label: "Strong Introduction" },
                          ] as const).map((section) => (
                            <button
                              key={section.key}
                              onClick={() => setAutoModeIncludeSections(prev => ({ ...prev, [section.key]: !prev[section.key as keyof typeof prev] }))}
                              className={cn(
                                "flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-all",
                                autoModeIncludeSections[section.key as keyof typeof autoModeIncludeSections]
                                  ? "bg-rose-500/10 border-rose-500 text-white"
                                  : "bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:border-neutral-600"
                              )}
                            >
                              <div className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center",
                                autoModeIncludeSections[section.key as keyof typeof autoModeIncludeSections] ? "bg-rose-500 border-rose-500" : "border-neutral-600"
                              )}>
                                {autoModeIncludeSections[section.key as keyof typeof autoModeIncludeSections] && <Check className="h-3 w-3 text-white" />}
                              </div>
                              {section.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom CTA */}
                      <div>
                        <label className="text-sm font-medium text-neutral-300 mb-2 block">Custom Call-to-Action</label>
                        <input
                          type="text"
                          value={autoModeCustomCta}
                          onChange={(e) => setAutoModeCustomCta(e.target.value)}
                          placeholder="e.g., Start your free trial today"
                          className="w-full px-3 py-2.5 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Advanced Tab */}
                  {autoModeTab === "advanced" && (
                    <div className="space-y-6">
                      {/* AI Model Selection */}
                      <div>
                        <label className="text-sm font-medium text-neutral-300 mb-2 block flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-rose-400" />
                          AI Model
                        </label>
                        <div className="space-y-2">
                          {/* Premium Models */}
                          <div className="p-0.5 bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 rounded-xl">
                            <div className="bg-neutral-900 rounded-[10px] p-2 space-y-2">
                              <div className="flex items-center gap-1.5 px-2">
                                <Star className="h-3 w-3 text-amber-400" />
                                <span className="text-[10px] text-amber-400 font-medium uppercase tracking-wider">Premium</span>
                              </div>
                              {([
                                { value: "google/gemini-3-pro-preview", label: "Gemini 3 Pro", desc: "Best for writing", credits: "~15 credits/post", recommended: true },
                                { value: "openai/gpt-4.1", label: "GPT-4.1", desc: "OpenAI flagship", credits: "~20 credits/post", recommended: false },
                              ] as const).map((model) => (
                                <button
                                  key={model.value}
                                  onClick={() => setAutoModeModel(model.value)}
                                  className={cn(
                                    "w-full p-3 rounded-lg border text-left transition-all relative",
                                    autoModeModel === model.value
                                      ? "bg-rose-500/10 border-rose-500"
                                      : "bg-neutral-800/50 border-neutral-700 hover:border-neutral-600"
                                  )}
                                >
                                  {model.recommended && (
                                    <span className="absolute -top-2 right-2 px-2 py-0.5 bg-rose-500 text-[9px] font-semibold text-white rounded-full">BEST</span>
                                  )}
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className={cn("text-sm font-medium block", autoModeModel === model.value ? "text-white" : "text-neutral-300")}>{model.label}</span>
                                      <span className="text-[10px] text-neutral-500">{model.desc}</span>
                                    </div>
                                    <span className="text-[10px] text-amber-400/80">{model.credits}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Standard Models */}
                          <div className="grid grid-cols-2 gap-2">
                            {([
                              { value: "google/gemini-3-flash-preview", label: "Gemini 3 Flash", desc: "Fast & capable", credits: "~3 credits" },
                              { value: "x-ai/grok-3-mini", label: "Grok 3", desc: "X/Twitter AI", credits: "~4 credits" },
                            ] as const).map((model) => (
                              <button
                                key={model.value}
                                onClick={() => setAutoModeModel(model.value)}
                                className={cn(
                                  "p-3 rounded-lg border text-left transition-all",
                                  autoModeModel === model.value
                                    ? "bg-rose-500/10 border-rose-500"
                                    : "bg-neutral-800/50 border-neutral-700 hover:border-neutral-600"
                                )}
                              >
                                <span className={cn("text-sm font-medium block", autoModeModel === model.value ? "text-white" : "text-neutral-300")}>{model.label}</span>
                                <div className="flex items-center justify-between mt-0.5">
                                  <span className="text-[10px] text-neutral-500">{model.desc}</span>
                                  <span className="text-[10px] text-neutral-400">{model.credits}</span>
                                </div>
                              </button>
                            ))}
                          </div>

                          {/* Budget Models */}
                          <div className="grid grid-cols-2 gap-2">
                            {([
                              { value: "google/gemini-2.5-flash", label: "Gemini 2.5", desc: "Cost effective", credits: "~1 credit" },
                              { value: "openai/gpt-4.1-mini", label: "GPT-4.1 Mini", desc: "Affordable", credits: "~2 credits" },
                            ] as const).map((model) => (
                              <button
                                key={model.value}
                                onClick={() => setAutoModeModel(model.value)}
                                className={cn(
                                  "p-3 rounded-lg border text-left transition-all",
                                  autoModeModel === model.value
                                    ? "bg-rose-500/10 border-rose-500"
                                    : "bg-neutral-800/50 border-neutral-700 hover:border-neutral-600"
                                )}
                              >
                                <span className={cn("text-sm font-medium block", autoModeModel === model.value ? "text-white" : "text-neutral-300")}>{model.label}</span>
                                <div className="flex items-center justify-between mt-0.5">
                                  <span className="text-[10px] text-neutral-500">{model.desc}</span>
                                  <span className="text-[10px] text-green-400/80">{model.credits}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Readability Level */}
                      <div>
                        <label className="text-sm font-medium text-neutral-300 mb-2 block">Readability Level</label>
                        <div className="grid grid-cols-3 gap-2">
                          {([
                            { value: "simple", label: "Simple", desc: "Grade 6-8 reading level" },
                            { value: "moderate", label: "Moderate", desc: "Grade 9-12 reading level" },
                            { value: "advanced", label: "Advanced", desc: "College+ reading level" },
                          ] as const).map((level) => (
                            <button
                              key={level.value}
                              onClick={() => setAutoModeReadabilityLevel(level.value)}
                              className={cn(
                                "p-3 rounded-lg border text-center transition-all",
                                autoModeReadabilityLevel === level.value
                                  ? "bg-rose-500/10 border-rose-500"
                                  : "bg-neutral-800/50 border-neutral-700 hover:border-neutral-600"
                              )}
                            >
                              <span className={cn("text-sm font-medium block", autoModeReadabilityLevel === level.value ? "text-white" : "text-neutral-300")}>{level.label}</span>
                              <span className="text-[10px] text-neutral-500">{level.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Generate Outline First */}
                      <div className="p-4 bg-neutral-800/50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-neutral-300">Generate Outline First</p>
                            <p className="text-xs text-neutral-500 mt-0.5">Review the structure before generating full content</p>
                          </div>
                          <button
                            onClick={() => setAutoModeOutlineFirst(!autoModeOutlineFirst)}
                            className={cn(
                              "w-11 h-6 rounded-full transition-colors relative",
                              autoModeOutlineFirst ? "bg-rose-500" : "bg-neutral-700"
                            )}
                          >
                            <div className={cn(
                              "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                              autoModeOutlineFirst ? "left-5" : "left-0.5"
                            )} />
                          </button>
                        </div>
                      </div>

                      {/* What Auto Mode Does */}
                      <div className="p-4 bg-gradient-to-br from-rose-500/10 to-purple-500/10 border border-rose-500/20 rounded-xl">
                        <p className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                          <Rocket className="h-4 w-4 text-rose-400" />
                          What Auto Mode Pro will do:
                        </p>
                        <div className="space-y-2">
                          {[
                            "Research trending angles and competitor content",
                            "Find optimal keywords with search intent analysis",
                            "Generate SEO-optimized title, meta, and structure",
                            "Write complete, well-researched blog post",
                            "Create social media content for X, Instagram, Facebook",
                            "Optimize for featured snippets (if enabled)",
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-neutral-400">
                              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Loading State */}
              {(autoModeStep === "researching" || autoModeStep === "writing") && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500/20 to-purple-500/20 flex items-center justify-center">
                      <Bot className="h-10 w-10 text-rose-400" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
                  </div>
                  <p className="text-lg font-medium text-white mt-6">
                    {autoModeStep === "researching" ? "Researching & analyzing..." : "Crafting your content..."}
                  </p>
                  <p className="text-sm text-neutral-500 mt-2">This may take 30-60 seconds</p>

                  <div className="flex items-center gap-3 mt-8">
                    <div className={cn("flex items-center gap-2 text-sm", autoModeStep === "researching" ? "text-rose-400" : "text-green-400")}>
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                        autoModeStep === "researching" ? "bg-rose-500 text-white animate-pulse" : "bg-green-500 text-white"
                      )}>{autoModeStep === "researching" ? "1" : <Check className="h-3 w-3" />}</div>
                      Research
                    </div>
                    <div className="w-8 h-px bg-neutral-700" />
                    <div className={cn("flex items-center gap-2 text-sm", autoModeStep === "writing" ? "text-rose-400" : "text-neutral-500")}>
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                        autoModeStep === "writing" ? "bg-rose-500 text-white animate-pulse" : "bg-neutral-700 text-neutral-400"
                      )}>2</div>
                      Write
                    </div>
                    <div className="w-8 h-px bg-neutral-700" />
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-medium text-neutral-400">3</div>
                      Done
                    </div>
                  </div>
                </div>
              )}

              {/* Result */}
              {autoModeStep === "done" && autoModeResult && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-green-300">Content generated successfully!</p>
                      <p className="text-xs text-neutral-400">Review and apply to your editor</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1 block">Title</label>
                    <p className="text-lg font-semibold text-white">{autoModeResult.title}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1 block">Category</label>
                      <p className="text-sm text-neutral-300">{autoModeResult.category}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1 block">Target Keyword</label>
                      <p className="text-sm text-rose-400">{autoModeResult.targetKeyword}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1 block">Meta Description</label>
                    <p className="text-sm text-neutral-400">{autoModeResult.metaDescription}</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2 block">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {autoModeResult.tags?.map((tag, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-neutral-800 text-neutral-300 rounded">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2 block">Content Preview</label>
                    <div className="p-4 bg-neutral-800/50 rounded-xl max-h-48 overflow-y-auto prose prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: autoModeResult.content.slice(0, 1500) + "..." }} />
                  </div>

                  {autoModeResult.socialMedia && (
                    <div className="space-y-3">
                      <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide block">Social Media Ready</label>
                      {autoModeResult.socialMedia.twitterPost && (
                        <div className="p-3 bg-neutral-800/50 rounded-lg">
                          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1"><Twitter className="h-3 w-3" />X (Twitter)</div>
                          <p className="text-sm text-neutral-300">{autoModeResult.socialMedia.twitterPost}</p>
                        </div>
                      )}
                      {autoModeResult.socialMedia.instagramCaption && (
                        <div className="p-3 bg-neutral-800/50 rounded-lg">
                          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/></svg>
                            Instagram
                          </div>
                          <p className="text-sm text-neutral-300 whitespace-pre-line">{autoModeResult.socialMedia.instagramCaption}</p>
                        </div>
                      )}
                      {autoModeResult.socialMedia.facebookPost && (
                        <div className="p-3 bg-neutral-800/50 rounded-lg">
                          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            Facebook
                          </div>
                          <p className="text-sm text-neutral-300">{autoModeResult.socialMedia.facebookPost}</p>
                        </div>
                      )}
                      {autoModeResult.socialMedia.hashtags?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {autoModeResult.socialMedia.hashtags.map((tag, i) => (
                            <span key={i} className="text-xs text-rose-400">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 p-4 border-t border-neutral-800">
              {autoModeStep === "idle" && !autoModeResult && (
                <>
                  <div className="text-xs text-neutral-500">
                    {autoModeTopic ? `Topic: "${autoModeTopic.slice(0, 30)}${autoModeTopic.length > 30 ? "..." : ""}"` : "Enter a topic to begin"}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAutoMode(false)}
                      className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={runAutoMode}
                      disabled={!autoModeTopic.trim() || isAutoGenerating}
                      className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:from-neutral-700 disabled:to-neutral-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-rose-500/25"
                    >
                      <Rocket className="h-4 w-4" />
                      Generate Content
                    </button>
                  </div>
                </>
              )}

              {autoModeStep === "done" && autoModeResult && (
                <>
                  <button
                    onClick={() => { setAutoModeResult(null); setAutoModeStep("idle"); }}
                    className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium transition-colors"
                  >
                    Start Over
                  </button>
                  <button
                    onClick={applyAutoContent}
                    className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-semibold rounded-xl transition-all"
                  >
                    <Check className="h-4 w-4" />
                    Apply to Editor
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Toolbar - compact and swipeable */}
      <div className="flex items-center gap-1 px-2 py-2 border-b border-neutral-800 bg-neutral-900/50 overflow-x-auto scrollbar-hide">
        {/* Essential formatting - always visible */}
        <div className="flex items-center gap-0.5 shrink-0">
          <ToolbarButton onClick={formatBold} title="Bold">
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={formatItalic} title="Italic">
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={formatUnderline} title="Underline">
            <Underline className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-neutral-700 mx-1 shrink-0" />

        {/* Headings - dropdown on mobile, buttons on desktop */}
        <div className="sm:hidden shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 rounded px-2 py-1.5 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white">
                <Heading1 className="h-4 w-4" />
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-neutral-900 border-neutral-700">
              <DropdownMenuItem onClick={formatH1} className="flex items-center gap-2 text-neutral-200 cursor-pointer">
                <Heading1 className="h-4 w-4" /> Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={formatH2} className="flex items-center gap-2 text-neutral-200 cursor-pointer">
                <Heading2 className="h-4 w-4" /> Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={formatH3} className="flex items-center gap-2 text-neutral-200 cursor-pointer">
                <Heading3 className="h-4 w-4" /> Heading 3
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="hidden sm:flex items-center gap-0.5 shrink-0">
          <ToolbarButton onClick={formatH1} title="Heading 1">
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={formatH2} title="Heading 2">
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={formatH3} title="Heading 3">
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-neutral-700 mx-1 shrink-0" />

        {/* Lists */}
        <div className="flex items-center gap-0.5 shrink-0">
          <ToolbarButton onClick={formatBulletList} title="Bullet List">
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={formatNumberedList} title="Numbered List">
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* More options dropdown on mobile */}
        <div className="sm:hidden shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 rounded px-2 py-1.5 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white">
                <span className="text-xs">More</span>
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-neutral-900 border-neutral-700">
              <DropdownMenuItem onClick={formatBlockquote} className="flex items-center gap-2 text-neutral-200 cursor-pointer">
                <Quote className="h-4 w-4" /> Quote
              </DropdownMenuItem>
              <DropdownMenuItem onClick={formatLink} className="flex items-center gap-2 text-neutral-200 cursor-pointer">
                <LinkIcon className="h-4 w-4" /> Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={formatCode} className="flex items-center gap-2 text-neutral-200 cursor-pointer">
                <Code className="h-4 w-4" /> Code
              </DropdownMenuItem>
              <DropdownMenuItem onClick={formatStrikethrough} className="flex items-center gap-2 text-neutral-200 cursor-pointer">
                <Strikethrough className="h-4 w-4" /> Strikethrough
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-700" />
              <DropdownMenuItem onClick={() => setShowImageModal(true)} className="flex items-center gap-2 text-neutral-200 cursor-pointer">
                <ImageIcon className="h-4 w-4" /> Insert Image
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-700" />
              <DropdownMenuItem onClick={formatUndo} className="flex items-center gap-2 text-neutral-200 cursor-pointer">
                <Undo className="h-4 w-4" /> Undo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={formatRedo} className="flex items-center gap-2 text-neutral-200 cursor-pointer">
                <Redo className="h-4 w-4" /> Redo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop: Show all buttons */}
        <div className="hidden sm:flex items-center gap-0.5 shrink-0">
          <ToolbarButton onClick={formatBlockquote} title="Blockquote">
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={formatLink} title="Insert Link">
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={formatCode} title="Inline Code">
            <Code className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={formatStrikethrough} title="Strikethrough">
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => setShowImageModal(true)} title="Insert Image">
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-neutral-700 mx-1 shrink-0" />
        
        {/* Undo/Redo - desktop only */}
        <div className="hidden sm:flex items-center gap-0.5 shrink-0">
          <ToolbarButton onClick={formatUndo} title="Undo">
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={formatRedo} title="Redo">
            <Redo className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px h-6 bg-neutral-700 mx-1" />
        </div>

        {/* AI dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-1 rounded px-2 py-1.5 text-sm font-medium transition-colors shrink-0",
                "text-rose-400 hover:bg-rose-500/20 hover:text-rose-300",
                isProcessing && "animate-pulse"
              )}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span className="hidden xs:inline">AI</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-48 bg-neutral-900 border-neutral-700"
          >
            {AI_COMMANDS.map((cmd, index) => (
              <div key={cmd.id}>
                {index === 5 && <DropdownMenuSeparator className="bg-neutral-700" />}
                <DropdownMenuItem
                  onClick={() => handleAICommand(cmd.id)}
                  className="flex items-center gap-2 text-neutral-200 focus:bg-neutral-800 focus:text-white cursor-pointer"
                >
                  <cmd.icon className="h-4 w-4 text-rose-400" />
                  {cmd.label}
                </DropdownMenuItem>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Model picker - hidden on very small screens */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="hidden xs:flex items-center gap-1 rounded px-2 py-1.5 text-xs sm:text-sm font-medium transition-colors text-neutral-400 hover:bg-neutral-800 hover:text-white shrink-0"
            >
              <span className="max-w-[50px] sm:max-w-none truncate">{AI_MODELS[selectedModel].name}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-neutral-900 border-neutral-700"
          >
            {Object.entries(AI_MODELS).map(([modelId, model]) => (
              <DropdownMenuItem
                key={modelId}
                onClick={() => setSelectedModel(modelId as keyof typeof AI_MODELS)}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  selectedModel === modelId 
                    ? "text-rose-400 bg-rose-500/10" 
                    : "text-neutral-200 focus:bg-neutral-800 focus:text-white"
                )}
              >
                {selectedModel === modelId && <CheckCircle className="h-3 w-3" />}
                <span className={selectedModel === modelId ? "" : "ml-5"}>{model.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Editor area - larger touch targets on mobile */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-20 sm:pb-4">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className={cn(
            "min-h-[calc(100vh-280px)] sm:min-h-[400px] outline-none text-white prose prose-invert max-w-none",
            "prose-base sm:prose-lg",
            "prose-headings:text-white prose-headings:font-bold",
            "prose-p:text-neutral-200 prose-p:leading-relaxed",
            "prose-a:text-rose-400 prose-a:no-underline hover:prose-a:underline",
            "prose-strong:text-white prose-code:text-rose-300 prose-code:bg-neutral-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded",
            "prose-blockquote:border-rose-500 prose-blockquote:text-neutral-400 prose-blockquote:not-italic",
            "prose-li:text-neutral-200",
            "[&>*:first-child]:mt-0",
            // Mobile: larger text and spacing for easier reading/editing
            "text-base sm:text-lg leading-7 sm:leading-8"
          )}
          data-placeholder="Start writing your story..."
          suppressContentEditableWarning
        />
      </div>

      {/* Mobile floating action button */}
      <div className="sm:hidden fixed bottom-20 right-4 z-40 flex flex-col gap-2">
        <button
          onClick={() => setShowPublishModal(true)}
          className="w-12 h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-lg shadow-rose-500/25 flex items-center justify-center transition-all active:scale-95"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>

      {/* Footer - sticky on mobile */}
      <div className="fixed sm:relative bottom-0 left-0 right-0 flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-2 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur-sm text-xs sm:text-sm text-neutral-500 z-30">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1 bg-neutral-800/50 px-2 py-1 rounded-md">
            <Target className="h-3 w-3" />
            <span className="font-medium text-neutral-300">{currentWordCount}</span>
            <span className="hidden xs:inline">words</span>
          </span>
          <span className="hidden sm:flex items-center gap-1 bg-neutral-800/50 px-2 py-1 rounded-md">
            <span className="font-medium text-neutral-300">{charCount}</span>
            <span>chars</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-neutral-600 text-xs">Ctrl+B/I/U for formatting</span>
          <button
            onClick={() => setShowPublishModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Send className="h-4 w-4" />
            <span>Publish</span>
          </button>
        </div>
      </div>
      
      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Send className="h-5 w-5 text-rose-500" />
                Publish Content
              </h2>
              <button
                onClick={() => setShowPublishModal(false)}
                className="p-1 text-neutral-500 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-4 space-y-5">
              {/* Platform Selection */}
              <div>
                <label className="text-sm font-medium text-neutral-300 mb-3 block">
                  Select Platforms
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(PLATFORM_STANDARDS) as Platform[]).map((platform) => {
                    const info = PLATFORM_STANDARDS[platform];
                    const isSelected = selectedPlatforms.includes(platform);
                    const status = getWordCountStatus(platform);

                    const PlatformIcon = () => {
                      if (platform === "twitter") return <Twitter className="h-5 w-5" />;
                      if (platform === "instagram") return (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                      );
                      return (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      );
                    };

                    return (
                      <button
                        key={platform}
                        onClick={() => togglePlatform(platform)}
                        className={cn(
                          "p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-2",
                          isSelected
                            ? "border-rose-500 bg-rose-500/10 text-rose-400"
                            : "border-neutral-700 hover:border-neutral-600 bg-neutral-800/50 text-neutral-400 hover:text-white"
                        )}
                      >
                        <PlatformIcon />
                        <span className="text-sm font-medium">{info.name}</span>
                        {isSelected && (
                          <span className={cn("text-xs", status.color)}>
                            {status.label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Word Count Progress */}
              {selectedPlatforms.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-neutral-300 block">
                    Word Count Progress
                  </label>
                  {selectedPlatforms.map((platform) => {
                    const info = PLATFORM_STANDARDS[platform];
                    const progress = Math.min((currentWordCount / info.idealWords) * 100, 150);
                    const isGood = progress >= 50 && progress <= 150;
                    
                    return (
                      <div key={platform} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-neutral-400">{info.name}</span>
                          <span className={isGood ? "text-green-500" : "text-yellow-500"}>
                            {currentWordCount} / {info.idealWords} words
                          </span>
                        </div>
                        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all",
                              isGood ? "bg-green-500" : "bg-yellow-500"
                            )}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Hashtag Generator */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                    <Hash className="h-4 w-4 text-rose-500" />
                    Hashtags
                  </label>
                  <button
                    onClick={generateHashtags}
                    disabled={isGeneratingHashtags}
                    className="flex items-center gap-1 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-800/50 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    {isGeneratingHashtags ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3 text-rose-400" />
                    )}
                    <span>Generate with AI</span>
                  </button>
                </div>
                
                {hashtags.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-3 bg-neutral-800/50 rounded-lg">
                    {hashtags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-rose-500/20 text-rose-400 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 p-3 bg-neutral-800/30 rounded-lg">
                    Click "Generate with AI" to create relevant hashtags for your content
                  </p>
                )}
              </div>
              
              {/* Copy Buttons */}
              {selectedPlatforms.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-2 block">
                    Copy for Platform
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPlatforms.map((platform) => {
                      const info = PLATFORM_STANDARDS[platform];
                      const isCopied = copiedPlatform === platform;
                      
                      return (
                        <button
                          key={platform}
                          onClick={() => copyForPlatform(platform)}
                          className={cn(
                            "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                            isCopied
                              ? "bg-green-500/20 text-green-400 border border-green-500/50"
                              : "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
                          )}
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-4 w-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              {info.name}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    Content will be formatted with hashtags and trimmed to platform limits
                  </p>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-neutral-800">
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Image Insertion Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-lg">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-rose-500" />
                Insert Image
              </h2>
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setImageUrl("");
                  setImageAlt("");
                  setImagePrompt("");
                }}
                className="p-1 text-neutral-500 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-4 space-y-4">
              {/* Image preview */}
              {imageUrl && (
                <div className="aspect-video rounded-lg overflow-hidden bg-neutral-800">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              
              {/* URL input */}
              <div>
                <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
              
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-neutral-900 text-neutral-500">or generate with AI</span>
                </div>
              </div>
              
              {/* AI generation */}
              <div>
                <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Describe your image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="A cozy coffee shop with warm lighting..."
                    className="flex-1 px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                    onKeyDown={(e) => e.key === "Enter" && handleGenerateImage()}
                  />
                  <button
                    onClick={handleGenerateImage}
                    disabled={!imagePrompt || isGeneratingImage}
                    className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-rose-500 hover:from-purple-600 hover:to-rose-600 disabled:from-neutral-700 disabled:to-neutral-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {isGeneratingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Generate
                  </button>
                </div>
              </div>
              
              {/* Alt text */}
              <div>
                <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Alt text (for accessibility & SEO)</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Describe what's in the image..."
                  className="w-full px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-neutral-800">
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setImageUrl("");
                  setImageAlt("");
                  setImagePrompt("");
                }}
                className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyImage}
                disabled={!imageUrl}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-neutral-700 disabled:text-neutral-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <ImageIcon className="h-4 w-4" />
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  active?: boolean;
}

function ToolbarButton({ onClick, title, children, active }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "p-1.5 sm:p-2 rounded transition-colors shrink-0",
        active
          ? "bg-rose-500/20 text-rose-400"
          : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}
