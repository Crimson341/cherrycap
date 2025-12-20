"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  FileText,
  BarChart3,
  Target,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Globe,
  Sparkles,
} from "lucide-react";
import { StarButton } from "@/components/ui/star-button";

interface SEOSidebarProps {
  title: string;
  content: string;
  metaDescription: string;
  targetKeyword: string;
  onMetaDescriptionChange: (value: string) => void;
  onTargetKeywordChange: (value: string) => void;
  onGenerateMetaDescription: () => void;
  className?: string;
}

export function SEOSidebar({
  title,
  content,
  metaDescription,
  targetKeyword,
  onMetaDescriptionChange,
  onTargetKeywordChange,
  onGenerateMetaDescription,
  className,
}: SEOSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    serp: true,
    title: true,
    meta: true,
    readability: true,
    keyword: true,
  });

  // Calculate SEO metrics
  const metrics = useMemo(() => {
    const plainText = content.replace(/<[^>]*>/g, "").trim();
    const words = plainText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const sentences = plainText.split(/[.!?]+/).filter(Boolean);
    const sentenceCount = sentences.length;
    const avgWordsPerSentence = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0;
    
    // Flesch-Kincaid Grade Level (simplified)
    const syllables = plainText.toLowerCase().replace(/[^a-z]/g, "").length / 3;
    const readingGrade = Math.round(
      0.39 * (wordCount / Math.max(sentenceCount, 1)) +
      11.8 * (syllables / Math.max(wordCount, 1)) -
      15.59
    );
    
    // Reading time (200 words per minute)
    const readingTime = Math.ceil(wordCount / 200);

    // Title analysis
    const titleLength = title.length;
    const titleOptimal = titleLength >= 50 && titleLength <= 60;

    // Meta description analysis
    const metaLength = metaDescription.length;
    const metaOptimal = metaLength >= 150 && metaLength <= 160;

    // Keyword analysis
    const keywordLower = targetKeyword.toLowerCase();
    const titleHasKeyword = keywordLower ? title.toLowerCase().includes(keywordLower) : false;
    const contentHasKeyword = keywordLower ? plainText.toLowerCase().includes(keywordLower) : false;
    const keywordCount = keywordLower
      ? (plainText.toLowerCase().match(new RegExp(keywordLower, "g")) || []).length
      : 0;
    const keywordDensity = wordCount > 0 ? ((keywordCount / wordCount) * 100).toFixed(1) : "0";

    return {
      wordCount,
      sentenceCount,
      avgWordsPerSentence,
      readingGrade: Math.max(0, readingGrade),
      readingTime,
      titleLength,
      titleOptimal,
      metaLength,
      metaOptimal,
      titleHasKeyword,
      contentHasKeyword,
      keywordCount,
      keywordDensity,
    };
  }, [title, content, metaDescription, targetKeyword]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className={cn("flex flex-col gap-4 p-4 bg-neutral-900 rounded-lg border border-neutral-800", className)}>
      <div className="flex items-center gap-2 text-lg font-semibold text-white">
        <Search className="h-5 w-5 text-rose-500" />
        SEO Analysis
      </div>

      {/* SERP Preview */}
      <Section
        title="SERP Preview"
        icon={Globe}
        expanded={expandedSections.serp}
        onToggle={() => toggleSection("serp")}
      >
        <div className="bg-white rounded-lg p-4 text-left">
          <div className="text-[#1a0dab] text-lg font-medium leading-tight hover:underline cursor-pointer truncate">
            {title || "Page Title"}
          </div>
          <div className="text-[#006621] text-sm mt-1">
            example.com › blog › {title.toLowerCase().replace(/\s+/g, "-").slice(0, 30)}
          </div>
          <div className="text-[#545454] text-sm mt-1 line-clamp-2">
            {metaDescription || "Add a meta description to see how your page will appear in search results..."}
          </div>
        </div>
      </Section>

      {/* Title Analysis */}
      <Section
        title="Title"
        icon={FileText}
        expanded={expandedSections.title}
        onToggle={() => toggleSection("title")}
        status={metrics.titleOptimal ? "good" : metrics.titleLength > 0 ? "warning" : "error"}
      >
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Length</span>
            <span className={cn(
              metrics.titleOptimal ? "text-green-500" : "text-yellow-500"
            )}>
              {metrics.titleLength}/60 characters
            </span>
          </div>
          <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all",
                metrics.titleOptimal ? "bg-green-500" : metrics.titleLength > 60 ? "bg-red-500" : "bg-yellow-500"
              )}
              style={{ width: `${Math.min(100, (metrics.titleLength / 60) * 100)}%` }}
            />
          </div>
          {!metrics.titleOptimal && (
            <p className="text-xs text-neutral-500">
              {metrics.titleLength < 50
                ? "Title is too short. Aim for 50-60 characters."
                : "Title is too long. Keep it under 60 characters."}
            </p>
          )}
        </div>
      </Section>

      {/* Meta Description */}
      <Section
        title="Meta Description"
        icon={FileText}
        expanded={expandedSections.meta}
        onToggle={() => toggleSection("meta")}
        status={metrics.metaOptimal ? "good" : metrics.metaLength > 0 ? "warning" : "error"}
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <textarea
              value={metaDescription}
              onChange={(e) => onMetaDescriptionChange(e.target.value)}
              placeholder="Write a compelling meta description..."
              className="w-full h-20 px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 resize-none focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <StarButton
              onClick={onGenerateMetaDescription}
              className="h-7 px-3 text-xs"
            >
              <Sparkles className="h-3 w-3" />
              Generate
            </StarButton>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Length</span>
            <span className={cn(
              metrics.metaOptimal ? "text-green-500" : "text-yellow-500"
            )}>
              {metrics.metaLength}/160 characters
            </span>
          </div>
          <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all",
                metrics.metaOptimal ? "bg-green-500" : metrics.metaLength > 160 ? "bg-red-500" : "bg-yellow-500"
              )}
              style={{ width: `${Math.min(100, (metrics.metaLength / 160) * 100)}%` }}
            />
          </div>
        </div>
      </Section>

      {/* Readability */}
      <Section
        title="Readability"
        icon={BarChart3}
        expanded={expandedSections.readability}
        onToggle={() => toggleSection("readability")}
      >
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Words" value={metrics.wordCount.toString()} />
          <StatCard label="Read Time" value={`${metrics.readingTime} min`} />
          <StatCard label="Sentences" value={metrics.sentenceCount.toString()} />
          <StatCard label="Avg Words/Sentence" value={metrics.avgWordsPerSentence.toString()} />
          <div className="col-span-2">
            <StatCard 
              label="Reading Level" 
              value={`Grade ${metrics.readingGrade}`}
              subtext={metrics.readingGrade <= 8 ? "Easy to read" : metrics.readingGrade <= 12 ? "Average" : "Complex"}
            />
          </div>
        </div>
      </Section>

      {/* Keyword Analysis */}
      <Section
        title="Target Keyword"
        icon={Target}
        expanded={expandedSections.keyword}
        onToggle={() => toggleSection("keyword")}
      >
        <div className="space-y-3">
          <input
            type="text"
            value={targetKeyword}
            onChange={(e) => onTargetKeywordChange(e.target.value)}
            placeholder="Enter target keyword..."
            className="w-full px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          
          {targetKeyword && (
            <div className="space-y-2">
              <CheckItem
                checked={metrics.titleHasKeyword}
                label="Keyword in title"
              />
              <CheckItem
                checked={metrics.contentHasKeyword}
                label="Keyword in content"
              />
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Keyword density</span>
                <span className={cn(
                  parseFloat(metrics.keywordDensity) >= 1 && parseFloat(metrics.keywordDensity) <= 3
                    ? "text-green-500"
                    : "text-yellow-500"
                )}>
                  {metrics.keywordDensity}% ({metrics.keywordCount} times)
                </span>
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

interface SectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  expanded: boolean;
  onToggle: () => void;
  status?: "good" | "warning" | "error";
  children: React.ReactNode;
}

function Section({ title, icon: Icon, expanded, onToggle, status, children }: SectionProps) {
  return (
    <div className="border border-neutral-800 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-3 py-2 bg-neutral-800/50 hover:bg-neutral-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-neutral-400" />
          <span className="text-sm font-medium text-white">{title}</span>
          {status && (
            status === "good" ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : status === "warning" ? (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-neutral-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-neutral-400" />
        )}
      </button>
      {expanded && <div className="p-3">{children}</div>}
    </div>
  );
}

function StatCard({ label, value, subtext }: { label: string; value: string; subtext?: string }) {
  return (
    <div className="bg-neutral-800/50 rounded-lg p-2 text-center">
      <div className="text-lg font-semibold text-white">{value}</div>
      <div className="text-xs text-neutral-400">{label}</div>
      {subtext && <div className="text-xs text-neutral-500 mt-0.5">{subtext}</div>}
    </div>
  );
}

function CheckItem({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {checked ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <AlertCircle className="h-4 w-4 text-yellow-500" />
      )}
      <span className={checked ? "text-green-500" : "text-yellow-500"}>{label}</span>
    </div>
  );
}
